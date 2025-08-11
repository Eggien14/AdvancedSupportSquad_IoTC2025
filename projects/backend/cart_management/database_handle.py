import pymysql
import json

# Database connection configuration
DB_HOST = 'localhost'
DB_PORT = 3306
DB_USER = 'root'
DB_PASSWORD = 'nhathaivu123'
DB_NAME = 'iot_challange'

class DatabaseHandler:
    def __init__(self, host=DB_HOST, port=DB_PORT, user=DB_USER, password=DB_PASSWORD, database=DB_NAME):
        self.connection = pymysql.connect(
            host=host,
            port=port,
            user=user,
            password=password,
            database=database,
            cursorclass=pymysql.cursors.DictCursor
        )
    

    def fetch_products_by_ids(self, ids):
        """
        Truy vấn DB để lấy thông tin sản phẩm theo danh sách ID 
        Input: [id1, id2, ...]
        Output: 
            {
              1: {'id': 1, 'name': 'Calculator', 'price': 50000, 'description': '...'}
              3: {'id': 3, 'name': 'Highlight pen', 'price': 15000, 'description': '...'}
            }   
        """
        if not ids:
            return {}
        # Đảm bảo ids là int 
        ids_list = [int(i) for i in ids]
        placeholders = ','.join(['%s'] * len(ids))
        sql = f"""
            SELECT id, name, price, description
            FROM product_info WHERE id IN ({placeholders})
        """
        cursor = self.connection.cursor(pymysql.cursors.DictCursor)
        try:
            # Thực hiện truy vấn
            cursor.execute(sql, tuple(ids_list))
            rows = cursor.fetchall()
        finally:
            cursor.close()
        # Chuyển đổi kết quả thành dictionary với id là key
        products ={}
        for row in rows:
            products[int(row['id'])] = row
        return products
    

    def cart_list_response(self, id_quantity_map):
        """
        Xây dựng phản hồi giỏ hàng từ id_quantity_map
        Input: {1: 2, 3: 1} (id: quantity)
        Output: 
            {
              'products': [
                {'id': 1, 'name': 'Calculator', 'quantity': 2, 'price': 50000, 'subtotal': 100000},
                {'id': 3, 'name': 'Highlight pen', 'quantity': 1, 'price': 15000, 'subtotal': 15000}
              ],
              'total': 115000
            }
        """
        if not id_quantity_map:
            return {'products': [], 'total': 0}

        ids = list(id_quantity_map.keys())
        products = self.fetch_products_by_ids(ids)

        cart_response = {
            'products': [],
            'total': 0
        }

        for product_id, quantity in id_quantity_map.items():
            if product_id in products:
                product = products[product_id]
                price = int(product['price'])      
                subtotal = price * quantity
                cart_response['products'].append({
                    'id': product_id,
                    'name': product['name'],
                    'quantity': quantity,
                    'price': price,
                    'subtotal': subtotal
                })
                cart_response['total'] += subtotal
        return cart_response
    


    def close(self):
        """
        Đóng kết nối Database
        """
        if self.connection:
            self.connection.close()