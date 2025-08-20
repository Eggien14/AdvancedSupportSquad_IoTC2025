# shared/repos.py
from typing import Optional, Iterable
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
    def search_by_name(name: str, limit: int = 20) -> list[dict]:
        sql = """
        SELECT
          product_id,
          product_name AS name,
          price
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
        Liệt kê theo KHU VỰC: trả id, name, price, type, area.
        Dùng LIKE để linh hoạt (ví dụ 'A-0' sẽ match 'A-01').
        """
        sql = """
        SELECT
          product_id,
          product_name AS name,
          price,
          product_type AS type,
          area
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
        Liệt kê theo LOẠI: trả id, name, price, type, area.
        """
        sql = """
        SELECT
          product_id,
          product_name AS name,
          price,
          product_type AS type,
          area
        FROM product_master
        WHERE product_type = %s
        ORDER BY product_name
        LIMIT %s
        """
        with get_conn() as conn, conn.cursor() as cur:
            cur.execute(sql, (p_type, int(limit)))
            return cur.fetchall()



class CartRepo:
    """CRUD cho giỏ hàng + truy vấn JOIN tên/giá."""

    @staticmethod
    def replace(cart_id: int, items: Iterable[tuple[int, int]]):
        """
        Thay thế toàn bộ giỏ: DELETE rồi INSERT items mới.
        items: iterable của (product_id, quantity)
        """
        with get_conn() as conn, conn.cursor() as cur:
            cur.execute("DELETE FROM cart_items WHERE cart_id=%s", (cart_id,))
            data = [(cart_id, int(pid), int(qty)) for pid, qty in items if int(qty) >= 0]
            if data:
                cur.executemany(
                    "INSERT INTO cart_items (cart_id, product_id, quantity) VALUES (%s,%s,%s)",
                    data,
                )

    @staticmethod
    def merge(cart_id: int, items: Iterable[tuple[int, int]]):
        """
        Set số lượng tuyệt đối cho các product có mặt (còn lại giữ nguyên).
        """
        data = [(cart_id, int(pid), int(qty)) for pid, qty in items if int(qty) >= 0]
        if not data:
            return
        sql = """
        INSERT INTO cart_items (cart_id, product_id, quantity)
        VALUES (%s,%s,%s)
        ON DUPLICATE KEY UPDATE quantity = VALUES(quantity)
        """
        with get_conn() as conn, conn.cursor() as cur:
            cur.executemany(sql, data)

    @staticmethod
    def apply_delta(cart_id: int, changes: Iterable[tuple[int, int]]):
        """
        Cộng/trừ theo delta; không để âm. Nếu chưa có hàng và delta>0 -> INSERT.
        """
        with get_conn() as conn, conn.cursor() as cur:
            for pid, delt in changes:
                delt = int(delt)
                pid = int(pid)
                cur.execute(
                    "UPDATE cart_items SET quantity = GREATEST(0, quantity + %s) "
                    "WHERE cart_id=%s AND product_id=%s",
                    (delt, cart_id, pid),
                )
                if cur.rowcount == 0 and delt > 0:
                    cur.execute(
                        "INSERT INTO cart_items (cart_id, product_id, quantity) VALUES (%s,%s,%s)",
                        (cart_id, pid, delt),
                    )

    @staticmethod
    def fetch_joined(cart_id: int) -> tuple[list[dict], Decimal]:
        """
        Lấy items đã JOIN tên + giá + subtotal. Trả (rows, total).
        rows: [{product_id, name, quantity, price, subtotal}]
        """
        sql = """
        SELECT
          ci.product_id,
          pm.product_name AS name,
          ci.quantity,
          pm.price,
          (ci.quantity * pm.price) AS subtotal
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