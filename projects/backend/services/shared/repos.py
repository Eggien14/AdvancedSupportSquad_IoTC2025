# shared/repos.py
from typing import Optional, Iterable, List, Dict, Any
from decimal import Decimal
from .db import get_conn

class ProductRepo:
    @staticmethod
    def get_by_id(product_id: int) -> Optional[dict]:
        sql = """
        SELECT
          product_id,
          product_name        AS name,
          product_type        AS type,
          area,
          price,
          quantity,
          weight_kg,
          manufacturer,
          expiry_or_mfg_date,
          origin,
          info1, info2, detail1, detail2
        FROM product_master
        WHERE product_id = %s
        LIMIT 1
        """
        with get_conn() as conn, conn.cursor() as cur:
            cur.execute(sql, (product_id,))
            return cur.fetchone()

    @staticmethod
    def search_by_name(name: str, limit: int = 50) -> list[dict]:
        sql = """
        SELECT
          product_id,
          product_name AS name,
          price,
          quantity,
          weight_kg
        FROM product_master
        WHERE product_name LIKE %s
        ORDER BY product_name
        LIMIT %s
        """
        like = f"%{name}%"
        with get_conn() as conn, conn.cursor() as cur:
            cur.execute(sql, (like, int(limit)))
            return cur.fetchall()
    @staticmethod
    def list_by_area(area: str, limit: int = 50) -> list[dict]:
        """
        Liệt kê theo KHU VỰC: trả id, name, price, type, area, weight_kg.
        Dùng LIKE để linh hoạt (ví dụ 'A-0' sẽ match 'A-01').
        """
        sql = """
        SELECT
          product_id,
          product_name AS name,
          price,
          quantity,
          product_type AS type,
          area,
          weight_kg
        FROM product_master
        WHERE area LIKE %s
        ORDER BY product_name
        LIMIT %s
        """
        like = f"%{area}%"
        with get_conn() as conn, conn.cursor() as cur:
            cur.execute(sql, (like, int(limit)))
            return cur.fetchall()

    @staticmethod
    def list_by_type(p_type: str, limit: int = 50) -> list[dict]:
        """
        Liệt kê theo LOẠI: trả id, name, price, type, area, weight_kg.
        """
        sql = """
        SELECT
          product_id,
          product_name AS name,
          price,
          quantity,
          product_type AS type,
          area,
          weight_kg
        FROM product_master
        WHERE product_type = %s
        ORDER BY product_name
        LIMIT %s
        """
        with get_conn() as conn, conn.cursor() as cur:
            cur.execute(sql, (p_type, int(limit)))
            return cur.fetchall()

    @staticmethod
    def update_inventory(product_id: int, quantity_delta: Decimal):
        """
        Cập nhật kho: cộng/trừ quantity theo delta.
        Không cho phép quantity âm (dùng GREATEST(0, ...)).
        Hỗ trợ decimal cho cả sản phẩm bán theo số lượng và theo cân.
        """
        sql = """
        UPDATE product_master 
        SET quantity = GREATEST(0, quantity + %s)
        WHERE product_id = %s
        """
        with get_conn() as conn, conn.cursor() as cur:
            cur.execute(sql, (quantity_delta, product_id))
            conn.commit()
            return cur.rowcount > 0

    @staticmethod
    def check_stock(product_id: int) -> int:
        """
        Kiểm tra số lượng tồn kho của sản phẩm.
        """
        sql = "SELECT quantity FROM product_master WHERE product_id = %s"
        with get_conn() as conn, conn.cursor() as cur:
            cur.execute(sql, (product_id,))
            result = cur.fetchone()
            return result['quantity'] if result else 0

    @staticmethod
    def list_all_simple() -> list[dict]:
        """
        Lấy tất cả sản phẩm chỉ với ID và name.
        """
        sql = """
        SELECT product_id, product_name AS name
        FROM product_master
        ORDER BY product_id
        """
        with get_conn() as conn, conn.cursor() as cur:
            cur.execute(sql)
            return cur.fetchall()

    @staticmethod
    def create_product(product_data: dict) -> int:
        """
        Tạo sản phẩm mới.
        Returns: product_id của sản phẩm vừa tạo
        """
        sql = """
        INSERT INTO product_master 
        (product_name, product_type, area, price, quantity, weight_kg, 
         manufacturer, expiry_or_mfg_date, origin, info1, info2, detail1, detail2)
        VALUES (%(product_name)s, %(product_type)s, %(area)s, %(price)s, %(quantity)s, 
                %(weight_kg)s, %(manufacturer)s, %(expiry_or_mfg_date)s, %(origin)s, 
                %(info1)s, %(info2)s, %(detail1)s, %(detail2)s)
        """
        with get_conn() as conn, conn.cursor() as cur:
            cur.execute(sql, product_data)
            conn.commit()
            return cur.lastrowid

    @staticmethod
    def update_product(product_id: int, product_data: dict) -> bool:
        """
        Cập nhật sản phẩm theo ID.
        Returns: True nếu có row được update, False nếu không tìm thấy product_id
        """
        sql = """
        UPDATE product_master 
        SET product_name = %(product_name)s,
            product_type = %(product_type)s,
            area = %(area)s,
            price = %(price)s,
            quantity = %(quantity)s,
            weight_kg = %(weight_kg)s,
            manufacturer = %(manufacturer)s,
            expiry_or_mfg_date = %(expiry_or_mfg_date)s,
            origin = %(origin)s,
            info1 = %(info1)s,
            info2 = %(info2)s,
            detail1 = %(detail1)s,
            detail2 = %(detail2)s,
            updated_at = CURRENT_TIMESTAMP
        WHERE product_id = %(product_id)s
        """
        with get_conn() as conn, conn.cursor() as cur:
            # Thêm product_id vào data
            update_data = {**product_data, 'product_id': product_id}
            cur.execute(sql, update_data)
            conn.commit()
            return cur.rowcount > 0

    @staticmethod
    def delete_product(product_id: int) -> bool:
        """
        Xóa sản phẩm theo ID.
        Returns: True nếu có row được xóa, False nếu không tìm thấy product_id
        """
        sql = "DELETE FROM product_master WHERE product_id = %s"
        with get_conn() as conn, conn.cursor() as cur:
            cur.execute(sql, (product_id,))
            conn.commit()
            return cur.rowcount > 0

    @staticmethod
    def update_or_create_product(product_id: int, product_data: dict) -> dict:
        """
        Cập nhật hoặc tạo mới sản phẩm:
        - Nếu product_id tồn tại: Cập nhật
        - Nếu product_id không tồn tại: Tạo mới với ID cụ thể
        Returns: Product data sau khi update/create
        """
        # Kiểm tra xem product có tồn tại không
        existing_product = ProductRepo.get_by_id(product_id)
        
        if existing_product:
            # Update existing product
            success = ProductRepo.update_product(product_id, product_data)
            if success:
                return ProductRepo.get_by_id(product_id)
            else:
                raise Exception(f"Failed to update product {product_id}")
        else:
            # Create new product with specific ID
            sql = """
            INSERT INTO product_master 
            (product_id, product_name, product_type, area, price, quantity, weight_kg, 
             manufacturer, expiry_or_mfg_date, origin, info1, info2, detail1, detail2)
            VALUES (%(product_id)s, %(product_name)s, %(product_type)s, %(area)s, %(price)s, %(quantity)s, 
                    %(weight_kg)s, %(manufacturer)s, %(expiry_or_mfg_date)s, %(origin)s, 
                    %(info1)s, %(info2)s, %(detail1)s, %(detail2)s)
            """
            with get_conn() as conn, conn.cursor() as cur:
                # Thêm product_id vào data
                create_data = {**product_data, 'product_id': product_id}
                cur.execute(sql, create_data)
                conn.commit()
                return ProductRepo.get_by_id(product_id)



class CartRepo:
    """CRUD cho giỏ hàng + truy vấn JOIN tên/giá."""

    @staticmethod
    def get_current_items(cart_id: int) -> dict[int, Decimal]:
        """
        Lấy items hiện tại trong cart dưới dạng {product_id: quantity}.
        Dùng để tính inventory delta. Quantity là Decimal hỗ trợ cả đơn vị và khối lượng.
        """
        sql = "SELECT product_id, quantity FROM cart_items WHERE cart_id = %s"
        with get_conn() as conn, conn.cursor() as cur:
            cur.execute(sql, (cart_id,))
            return {row['product_id']: Decimal(str(row['quantity'])) for row in cur.fetchall()}

    @staticmethod
    def replace(cart_id: int, items: Iterable[tuple[int, Decimal]]):
        """
        Thay thế toàn bộ giỏ: DELETE rồi INSERT items mới.
        Cập nhật inventory: trả lại toàn bộ items cũ, lấy items mới.
        items: iterable của (product_id, quantity) với quantity là Decimal
        """
        with get_conn() as conn, conn.cursor() as cur:
            # Lấy items hiện tại để tính inventory delta
            current_items = CartRepo.get_current_items(cart_id)
            
            # Xóa toàn bộ cart
            cur.execute("DELETE FROM cart_items WHERE cart_id=%s", (cart_id,))
            
            # Insert items mới
            new_items = {int(pid): Decimal(str(qty)) for pid, qty in items if Decimal(str(qty)) > 0}
            if new_items:
                data = [(cart_id, pid, qty) for pid, qty in new_items.items()]
                cur.executemany(
                    "INSERT INTO cart_items (cart_id, product_id, quantity) VALUES (%s,%s,%s)",
                    data,
                )
            
            # Cập nhật inventory: +current_items (trả lại), -new_items (lấy đi)
            all_product_ids = set(current_items.keys()) | set(new_items.keys())
            for product_id in all_product_ids:
                old_qty = current_items.get(product_id, Decimal('0'))
                new_qty = new_items.get(product_id, Decimal('0'))
                inventory_delta = old_qty - new_qty  # + nghĩa là trả về kho, - nghĩa là lấy từ kho
                
                if inventory_delta != 0:
                    cur.execute(
                        "UPDATE product_master SET quantity = GREATEST(0, quantity + %s) WHERE product_id = %s",
                        (inventory_delta, product_id)
                    )
            
            # Commit all changes
            conn.commit()

    @staticmethod
    def merge(cart_id: int, items: Iterable[tuple[int, Decimal]]):
        """
        Set số lượng tuyệt đối cho các product có mặt (còn lại giữ nguyên).
        Nếu quantity = 0 thì xóa record.
        Cập nhật inventory theo thay đổi. Hỗ trợ decimal cho cả đơn vị và khối lượng.
        """
        with get_conn() as conn, conn.cursor() as cur:
            for pid, qty in items:
                pid = int(pid)
                qty = Decimal(str(qty))
                
                # Lấy quantity hiện tại trong cart
                cur.execute("SELECT quantity FROM cart_items WHERE cart_id=%s AND product_id=%s", 
                           (cart_id, pid))
                current_result = cur.fetchone()
                current_qty = Decimal(str(current_result['quantity'])) if current_result else Decimal('0')
                
                if qty > 0:
                    # Insert hoặc update với quantity > 0
                    cur.execute("""
                        INSERT INTO cart_items (cart_id, product_id, quantity)
                        VALUES (%s,%s,%s)
                        ON DUPLICATE KEY UPDATE quantity = VALUES(quantity)
                    """, (cart_id, pid, qty))
                elif qty == 0:
                    # Xóa record khi quantity = 0
                    cur.execute(
                        "DELETE FROM cart_items WHERE cart_id=%s AND product_id=%s",
                        (cart_id, pid)
                    )
                
                # Cập nhật inventory: old_qty - new_qty
                inventory_delta = current_qty - qty  # + nghĩa là trả về kho, - nghĩa là lấy từ kho
                if inventory_delta != 0:
                    cur.execute(
                        "UPDATE product_master SET quantity = GREATEST(0, quantity + %s) WHERE product_id = %s",
                        (inventory_delta, pid)
                    )
            
            # Commit all changes
            conn.commit()

    @staticmethod
    def apply_delta(cart_id: int, changes: Iterable[tuple[int, Decimal]]):
        """
        Cộng/trừ theo delta; không để âm. 
        Nếu chưa có hàng và delta>0 -> INSERT.
        Nếu quantity <= 0 thì xóa record.
        Cập nhật inventory với logic đặc biệt cho delta âm. Hỗ trợ decimal cho cả đơn vị và khối lượng.
        """
        with get_conn() as conn, conn.cursor() as cur:
            inventory_updates = []  # Store inventory updates to apply later
            
            for pid, delt in changes:
                delt = Decimal(str(delt))
                pid = int(pid)
                
                # Lấy quantity hiện tại trước khi thay đổi
                cur.execute("SELECT quantity FROM cart_items WHERE cart_id=%s AND product_id=%s", 
                           (cart_id, pid))
                current_result = cur.fetchone()
                current_qty = Decimal(str(current_result['quantity'])) if current_result else Decimal('0')
                
                # Tính new_quantity và actual_delta
                new_qty = max(Decimal('0'), current_qty + delt)  # Không cho âm
                actual_delta = new_qty - current_qty  # Delta thực tế được áp dụng
                
                if current_result:
                    # Update existing record
                    if new_qty > 0:
                        cur.execute(
                            "UPDATE cart_items SET quantity = %s WHERE cart_id=%s AND product_id=%s",
                            (new_qty, cart_id, pid)
                        )
                    else:
                        # Delete if quantity becomes 0
                        cur.execute(
                            "DELETE FROM cart_items WHERE cart_id=%s AND product_id=%s",
                            (cart_id, pid)
                        )
                elif delt > 0:
                    # Insert new record only if delta > 0
                    cur.execute(
                        "INSERT INTO cart_items (cart_id, product_id, quantity) VALUES (%s,%s,%s)",
                        (cart_id, pid, delt)
                    )
                    actual_delta = delt
                
                # Store inventory update (âm actual_delta nghĩa là lấy từ kho)
                if actual_delta != 0:
                    inventory_updates.append((pid, -actual_delta))
            
            # Apply inventory updates within same transaction
            for pid, inv_delta in inventory_updates:
                cur.execute(
                    "UPDATE product_master SET quantity = GREATEST(0, quantity + %s) WHERE product_id = %s",
                    (inv_delta, pid)
                )
            
            # Commit tất cả changes
            conn.commit()

    @staticmethod
    def fetch_joined(cart_id: int) -> tuple[list[dict], Decimal]:
        """
        Lấy items đã JOIN tên + giá + subtotal. Trả (rows, total).
        rows: [{product_id, name, quantity, price, subtotal}]
        Logic tính subtotal:
        - Nếu weight_kg = 0 (bán theo số lượng): subtotal = quantity * price
        - Nếu weight_kg > 0 (bán theo cân): subtotal = (quantity / weight_kg) * price
        """
        sql = """
        SELECT
          ci.product_id,
          pm.product_name AS name,
          ci.quantity,
          pm.price,
          pm.weight_kg,
          CASE 
            WHEN pm.weight_kg = 0 OR pm.weight_kg IS NULL THEN 
              ci.quantity * pm.price
            ELSE 
              (ci.quantity / pm.weight_kg) * pm.price
          END AS subtotal
        FROM cart_items ci
        JOIN product_master pm ON pm.product_id = ci.product_id
        WHERE ci.cart_id = %s
        ORDER BY pm.product_name
        """
        with get_conn() as conn, conn.cursor() as cur:
            cur.execute(sql, (cart_id,))
            rows = cur.fetchall() or []
        total = sum((row["subtotal"] for row in rows), Decimal("0"))
        return rows, total

    @staticmethod
    def count_items(cart_id: int) -> int:
        with get_conn() as conn, conn.cursor() as cur:
            cur.execute("SELECT COUNT(*) AS n FROM cart_items WHERE cart_id=%s", (cart_id,))
            return int((cur.fetchone() or {}).get("n", 0))


class CartConfigRepo:
    @staticmethod
    def get_by_cart_id(cart_id: int) -> Optional[dict]:
        """Lấy thông tin cấu hình của cart theo ID"""
        sql = """
        SELECT 
          cart_id,
          cart_position,
          cart_state, 
          cart_voice_cmd,
          cart_ota,
          cam_stream_url
        FROM cart_config 
        WHERE cart_id = %s
        LIMIT 1
        """
        with get_conn() as conn, conn.cursor() as cur:
            cur.execute(sql, (cart_id,))
            return cur.fetchone()
    
    @staticmethod  
    def upsert(cart_id: int, cart_position: str = None, cart_state: str = None, 
               cart_voice_cmd: str = None, cart_ota: str = None, cam_stream_url: str = None) -> bool:
        """Thêm mới hoặc cập nhật thông tin cart config"""
        sql = """
        INSERT INTO cart_config 
        (cart_id, cart_position, cart_state, cart_voice_cmd, cart_ota, cam_stream_url)
        VALUES (%s, %s, %s, %s, %s, %s)
        ON DUPLICATE KEY UPDATE
          cart_position = VALUES(cart_position),
          cart_state = VALUES(cart_state), 
          cart_voice_cmd = VALUES(cart_voice_cmd),
          cart_ota = VALUES(cart_ota),
          cam_stream_url = VALUES(cam_stream_url)
        """
        try:
            with get_conn() as conn, conn.cursor() as cur:
                cur.execute(sql, (cart_id, cart_position, cart_state, cart_voice_cmd, cart_ota, cam_stream_url))
                conn.commit()
                return True
        except Exception as e:
            print(f"Error upserting cart_config: {e}")
            return False


class MapBeaconRepo:
    """Repository cho map beacon data"""
    
    @staticmethod
    def get_by_map_id(map_id: int) -> List[Dict[str, Any]]:
        """Lấy tất cả beacon của map_id"""
        sql = """
        SELECT 
          map_id,
          beacon_id,
          beacon_blea_uuid,
          beacon_x_coordinate,
          beacon_y_coordinate,
          beacon_D0,
          beacon_n
        FROM map_beacon 
        WHERE map_id = %s
        ORDER BY beacon_id
        """
        with get_conn() as conn, conn.cursor() as cur:
            cur.execute(sql, (map_id,))
            return cur.fetchall()
    
    @staticmethod
    def get_by_map_and_beacon(map_id: int, beacon_id: str) -> Optional[Dict[str, Any]]:
        """Lấy thông tin 1 beacon cụ thể"""
        sql = """
        SELECT 
          map_id,
          beacon_id,
          beacon_blea_uuid,
          beacon_x_coordinate,
          beacon_y_coordinate,
          beacon_D0,
          beacon_n
        FROM map_beacon 
        WHERE map_id = %s AND beacon_id = %s
        LIMIT 1
        """
        with get_conn() as conn, conn.cursor() as cur:
            cur.execute(sql, (map_id, beacon_id))
            return cur.fetchone()
    
    @staticmethod
    def upsert(map_id: int, beacon_id: str, beacon_blea_uuid: str = None,
               beacon_x_coordinate: float = None, beacon_y_coordinate: float = None,
               beacon_D0: float = None, beacon_n: float = None) -> bool:
        """Insert hoặc update beacon config"""
        sql = """
        INSERT INTO map_beacon 
        (map_id, beacon_id, beacon_blea_uuid, beacon_x_coordinate, beacon_y_coordinate, beacon_D0, beacon_n)
        VALUES (%s, %s, %s, %s, %s, %s, %s)
        ON DUPLICATE KEY UPDATE
          beacon_blea_uuid = VALUES(beacon_blea_uuid),
          beacon_x_coordinate = VALUES(beacon_x_coordinate),
          beacon_y_coordinate = VALUES(beacon_y_coordinate),
          beacon_D0 = VALUES(beacon_D0),
          beacon_n = VALUES(beacon_n)
        """
        try:
            with get_conn() as conn, conn.cursor() as cur:
                cur.execute(sql, (map_id, beacon_id, beacon_blea_uuid, beacon_x_coordinate, beacon_y_coordinate, beacon_D0, beacon_n))
                conn.commit()
                return True
        except Exception as e:
            print(f"Error upserting map_beacon: {e}")
            return False