# services/shared/services.py
"""
Business logic layer - Service classes containing domain logic.
Sits between API endpoints and Repository layer.
"""
import logging
from typing import List, Optional, Dict, Any
from decimal import Decimal, InvalidOperation
from fastapi import HTTPException

from .repos import ProductRepo, CartRepo, CartConfigRepo, MapBeaconRepo
from .settings import get_settings

# Simplified - use print instead of logger
settings = get_settings()


class ProductService:
    """
    Product domain service containing business logic.
    Handles validation, business rules, and data transformation.
    """
    
    @staticmethod
    def get_product_detail(product_id: int) -> Dict[str, Any]:
        """
        Get product detail with business validation.
        
        Args:
            product_id: Product ID to retrieve
            
        Returns:
            dict: Product detail data
            
        Raises:
            HTTPException: 400 for invalid ID, 404 for not found
        """
        # Business validation
        if product_id <= 0:
            print(f"Invalid product ID requested: {product_id}")
            raise HTTPException(
                status_code=400, 
                detail="Product ID must be a positive integer"
            )
        
        # Repository call
        product = ProductRepo.get_by_id(product_id)
        
        if not product:
            print(f"Product not found: {product_id}")
            raise HTTPException(
                status_code=404, 
                detail=f"Product with ID {product_id} not found"
            )
        
        print(f"Product retrieved successfully: {product_id}")
        return product
    
    @staticmethod
    def search_products(name: str, limit: int = 50) -> List[Dict[str, Any]]:
        """
        Search products by name with business validation.
        
        Args:
            name: Search term
            limit: Maximum results to return
            
        Returns:
            list: List of matching products
            
        Raises:
            HTTPException: 400 for invalid parameters
        """
        # Business validation
        if not name or len(name.strip()) < 2:
            raise HTTPException(
                status_code=400,
                detail="Search term must be at least 2 characters long"
            )
        
        if limit <= 0 or limit > 100:
            raise HTTPException(
                status_code=400,
                detail="Limit must be between 1 and 100"
            )
        
        # Clean search term
        clean_name = name.strip()
        
        # Repository call
        products = ProductRepo.search_by_name(clean_name, limit)
        
        print(f"Product search: '{clean_name}' returned {len(products)} results")
        return products
    
    @staticmethod
    def list_products_by_area(area: str, limit: int = 50) -> List[Dict[str, Any]]:
        """
        List products by area with business validation.
        
        Args:
            area: Area code to filter by
            limit: Maximum results to return
            
        Returns:
            list: List of products in the specified area
            
        Raises:
            HTTPException: 400 for invalid parameters
        """
        # Business validation
        if not area or len(area.strip()) < 1:
            raise HTTPException(
                status_code=400,
                detail="Area code cannot be empty"
            )
        
        if limit <= 0 or limit > 200:
            raise HTTPException(
                status_code=400,
                detail="Limit must be between 1 and 200"
            )
        
        # Clean area code
        clean_area = area.strip().upper()
        
        # Repository call
        products = ProductRepo.list_by_area(clean_area, limit)
        
        print(f"Products by area '{clean_area}': {len(products)} found")
        return products
    
    @staticmethod
    def list_products_by_type(product_type: str, limit: int = 50) -> List[Dict[str, Any]]:
        """
        Get products by type - accepts any string, no enum restriction.
        
        Args:
            product_type: Product type to filter by (any string)
            limit: Maximum results to return
            
        Returns:
            list: List of products of the specified type
            
        Raises:
            HTTPException: 400 for invalid parameters
        """
        # Validate product_type is not empty
        if not product_type or not product_type.strip():
            raise HTTPException(
                status_code=400,
                detail="Product type cannot be empty"
            )
        
        clean_type = product_type.strip()
        
        if limit <= 0 or limit > 200:
            raise HTTPException(
                status_code=400,
                detail="Limit must be between 1 and 200"
            )
        
        # Repository call
        products = ProductRepo.list_by_type(clean_type, limit)
        
        print(f"Products by type '{clean_type}': {len(products)} found")
        return products

    @staticmethod
    def list_all_products_simple() -> List[Dict[str, Any]]:
        """
        Lấy tất cả sản phẩm chỉ với ID và name.
        
        Returns:
            list: List tất cả sản phẩm với ID và name
        """
        products = ProductRepo.list_all_simple()
        print(f"Retrieved all products: {len(products)} found")
        return products

    @staticmethod
    def update_or_create_product(product_id: int, product_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Cập nhật hoặc tạo mới sản phẩm.
        
        Args:
            product_id: ID sản phẩm
            product_data: Dữ liệu sản phẩm đã validate
            
        Returns:
            dict: Thông tin sản phẩm sau khi update/create
            
        Raises:
            HTTPException: 400 cho lỗi validation, 500 cho lỗi database
        """
        try:
            # Kiểm tra sản phẩm có tồn tại không
            existing_product = ProductRepo.get_by_id(product_id)
            
            if existing_product:
                # Trường hợp 2: Cập nhật sản phẩm hiện có
                success = ProductRepo.update_product(product_id, product_data)
                if not success:
                    raise HTTPException(
                        status_code=500,
                        detail=f"Failed to update product with ID {product_id}"
                    )
                print(f"Product updated successfully: {product_id}")
                
                # Lấy lại thông tin sau khi update
                updated_product = ProductRepo.get_by_id(product_id)
                return updated_product
            else:
                # Trường hợp 1: Tạo sản phẩm mới
                # Kiểm tra product_id có được sử dụng không (auto-increment)
                if product_id <= 0:
                    raise HTTPException(
                        status_code=400,
                        detail="Product ID must be a positive integer"
                    )
                
                new_product_id = ProductRepo.create_product(product_data)
                print(f"Product created successfully with ID: {new_product_id}")
                
                # Lấy thông tin sản phẩm vừa tạo
                created_product = ProductRepo.get_by_id(new_product_id)
                return created_product
                
        except HTTPException:
            # Re-raise HTTPException as-is
            raise
        except Exception as e:
            print(f"Error in update_or_create_product: {str(e)}")
            raise HTTPException(
                status_code=500,
                detail=f"Internal server error: {str(e)}"
            )

    @staticmethod
    def delete_product(product_id: int) -> Dict[str, Any]:
        """
        Xóa sản phẩm theo ID.
        
        Args:
            product_id: ID sản phẩm cần xóa
            
        Returns:
            dict: Thông báo kết quả xóa
            
        Raises:
            HTTPException: 400 cho ID không hợp lệ, 404 cho không tìm thấy, 500 cho lỗi database
        """
        try:
            # Validate product_id
            if product_id <= 0:
                raise HTTPException(
                    status_code=400,
                    detail="Product ID must be a positive integer"
                )
            
            # Kiểm tra sản phẩm có tồn tại không
            existing_product = ProductRepo.get_by_id(product_id)
            if not existing_product:
                raise HTTPException(
                    status_code=404,
                    detail=f"Product with ID {product_id} not found"
                )
            
            # Xóa sản phẩm
            success = ProductRepo.delete_product(product_id)
            if not success:
                raise HTTPException(
                    status_code=500,
                    detail=f"Failed to delete product with ID {product_id}"
                )
            
            print(f"Product deleted successfully: {product_id}")
            return {
                "message": f"Product with ID {product_id} deleted successfully",
                "deleted_product_id": product_id,
                "deleted_product_name": existing_product.get("name", "Unknown")
            }
            
        except HTTPException:
            # Re-raise HTTPException as-is
            raise
        except Exception as e:
            print(f"Error in delete_product: {str(e)}")
            raise HTTPException(
                status_code=500,
                detail=f"Internal server error: {str(e)}"
            )


class CartService:
    """
    Cart domain service containing business logic.
    Handles cart operations, validation, and business rules.
    """
    
    @staticmethod
    def validate_cart_id(cart_id: int) -> None:
        """
        Validate cart ID.
        
        Args:
            cart_id: Cart ID to validate
            
        Raises:
            HTTPException: 400 for invalid cart ID
        """
        if cart_id <= 0:
            raise HTTPException(
                status_code=400,
                detail="Cart ID must be a positive integer"
            )
    
    @staticmethod
    def get_cart_with_totals(cart_id: int) -> Dict[str, Any]:
        """
        Get cart with calculated totals and business logic.
        
        Args:
            cart_id: Cart ID to retrieve
            
        Returns:
            dict: Cart data with items and totals
            
        Raises:
            HTTPException: 400 for invalid cart ID
        """
        # Validation
        CartService.validate_cart_id(cart_id)
        
        # Repository call
        items, total = CartRepo.fetch_joined(cart_id)
        
        # Business logic - calculate additional metrics
        total_items = len(items)
        total_quantity = sum(Decimal(str(item.get("quantity", 0))) for item in items)  # Hỗ trợ decimal cho cả đơn vị và khối lượng
        
        # Discount logic (example business rule)
        discount = Decimal("0")
        if total > Decimal("1000000"):  # VIP discount for orders > 1M VND
            discount = total * Decimal("0.05")  # 5% discount
        elif total > Decimal("500000"):  # Regular discount for orders > 500K VND
            discount = total * Decimal("0.02")  # 2% discount
        
        final_total = total - discount
        
        result = {
            "cart_id": cart_id,
            "items": items,
            "total": total,
            "discount": discount,
            "final_total": final_total,
            "total_items": total_items,
            "total_quantity": total_quantity
        }
        
        print(f"Cart {cart_id}: {total_items} items, total: {total}, final: {final_total}")
        return result
    
    @staticmethod
    def update_cart_replace(cart_id: int, items: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Replace entire cart contents with validation.
        
        Args:
            cart_id: Cart ID to update
            items: List of items to replace with
            
        Returns:
            dict: Operation result
            
        Raises:
            HTTPException: 400 for validation errors
        """
        # Validation
        CartService.validate_cart_id(cart_id)
        
        # Validate items
        validated_items = []
        for item in items:
            product_id = item.get("product_id")
            quantity = item.get("quantity")
            
            if not isinstance(product_id, int) or product_id <= 0:
                raise HTTPException(
                    status_code=400,
                    detail="All product IDs must be positive integers"
                )
            
            # Support both int and Decimal for quantity (int will be converted to Decimal)
            try:
                quantity_decimal = Decimal(str(quantity))
                if quantity_decimal < 0:
                    raise HTTPException(
                        status_code=400,
                        detail="All quantities must be non-negative (supports decimal for unit and weight)"
                    )
            except (ValueError, TypeError, InvalidOperation):
                raise HTTPException(
                    status_code=400,
                    detail="All quantities must be valid numbers (supports decimal for unit and weight)"
                )
            
            # Only include items with positive quantity
            if quantity_decimal > 0:
                validated_items.append((product_id, quantity_decimal))
        
        try:
            # Repository call
            CartRepo.replace(cart_id, validated_items)
            
            # Get updated count
            items_count = CartRepo.count_items(cart_id)
            
            print(f"Cart {cart_id} replaced with {len(validated_items)} items")
            return {
                "ok": True,
                "mode": "replace",
                "items_count": items_count,
                "processed_items": len(validated_items)
            }
            
        except Exception as e:
            print(f"Failed to replace cart {cart_id}: {e}")
            raise HTTPException(
                status_code=400,
                detail=f"Failed to update cart: {str(e)}"
            )
    
    @staticmethod
    def update_cart_merge(cart_id: int, items: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Merge items into existing cart with validation.
        
        Args:
            cart_id: Cart ID to update
            items: List of items to merge
            
        Returns:
            dict: Operation result
        """
        # Validation (similar to replace)
        CartService.validate_cart_id(cart_id)
        
        validated_items = []
        for item in items:
            product_id = item.get("product_id")
            quantity = item.get("quantity")
            
            if not isinstance(product_id, int) or product_id <= 0:
                raise HTTPException(
                    status_code=400,
                    detail="All product IDs must be positive integers"
                )
            
            # Support both int and Decimal for quantity (int will be converted to Decimal)
            try:
                quantity_decimal = Decimal(str(quantity))
                if quantity_decimal < 0:
                    raise HTTPException(
                        status_code=400,
                        detail="All quantities must be non-negative (supports decimal for unit and weight)"
                    )
            except (ValueError, TypeError, InvalidOperation):
                raise HTTPException(
                    status_code=400,
                    detail="All quantities must be valid numbers (supports decimal for unit and weight)"
                )
            
            validated_items.append((product_id, quantity_decimal))
        
        try:
            # Repository call
            CartRepo.merge(cart_id, validated_items)
            
            # Get updated count
            items_count = CartRepo.count_items(cart_id)
            
            print(f"Cart {cart_id} merged with {len(validated_items)} items")
            return {
                "ok": True,
                "mode": "merge",
                "items_count": items_count,
                "processed_items": len(validated_items)
            }
            
        except Exception as e:
            print(f"Failed to merge cart {cart_id}: {e}")
            raise HTTPException(
                status_code=400,
                detail=f"Failed to update cart: {str(e)}"
            )
    
    @staticmethod
    def update_cart_delta(cart_id: int, changes: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Apply delta changes to cart with validation.
        
        Args:
            cart_id: Cart ID to update
            changes: List of quantity changes to apply
            
        Returns:
            dict: Operation result
        """
        # Validation
        CartService.validate_cart_id(cart_id)
        
        validated_changes = []
        for change in changes:
            product_id = change.get("product_id")
            delta = change.get("delta")
            
            if not isinstance(product_id, int) or product_id <= 0:
                raise HTTPException(
                    status_code=400,
                    detail="All product IDs must be positive integers"
                )
            
            # Support both int and Decimal for delta (int will be converted to Decimal)
            try:
                delta_decimal = Decimal(str(delta))
            except (ValueError, TypeError, InvalidOperation):
                raise HTTPException(
                    status_code=400,
                    detail="All delta values must be valid numbers (supports decimal for unit and weight)"
                )
            
            # Only process meaningful changes
            if delta_decimal != 0:
                validated_changes.append((product_id, delta_decimal))
        
        try:
            # Repository call
            CartRepo.apply_delta(cart_id, validated_changes)
            
            # Get updated count
            items_count = CartRepo.count_items(cart_id)
            
            print(f"Cart {cart_id} delta applied with {len(validated_changes)} changes")
            return {
                "ok": True,
                "mode": "delta",
                "items_count": items_count,
                "processed_changes": len(validated_changes)
            }
            
        except Exception as e:
            print(f"Failed to apply delta to cart {cart_id}: {e}")
            raise HTTPException(
                status_code=400,
                detail=f"Failed to update cart: {str(e)}"
            )

    @staticmethod
    def upsert_cart_items(cart_id: int, cart_data) -> Dict[str, Any]:
        """
        Universal cart upsert method - routes to appropriate method based on mode.
        """
        mode = cart_data.mode
        
        if mode == "replace":
            items = [{"product_id": item.product_id, "quantity": item.quantity} 
                    for item in cart_data.items]
            return CartService.update_cart_replace(cart_id, items)
            
        elif mode == "merge":
            items = [{"product_id": item.product_id, "quantity": item.quantity} 
                    for item in cart_data.items]
            return CartService.update_cart_merge(cart_id, items)
            
        elif mode == "delta":
            changes = [{"product_id": change.product_id, "delta": change.delta} 
                      for change in cart_data.changes]
            return CartService.update_cart_delta(cart_id, changes)
            
        else:
            raise HTTPException(
                status_code=400,
                detail=f"Unsupported mode: {mode}"
            )


class CartConfigService:
    """
    Cart Configuration service cho BLE và camera settings.
    """
    
    @staticmethod
    def get_cart_config(cart_id: int) -> Dict[str, Any]:
        """Lấy thông tin cấu hình của cart"""
        cart_config = CartConfigRepo.get_by_cart_id(cart_id)
        
        if not cart_config:
            raise HTTPException(
                status_code=404,
                detail=f"Cart config not found for cart_id: {cart_id}"
            )
        
        print(f"Cart config retrieved for cart_id: {cart_id}")
        return cart_config
    
    @staticmethod
    def update_cart_config(cart_id: int, config_data: Dict[str, Any]) -> Dict[str, Any]:
        """Cập nhật hoặc tạo mới cấu hình cart"""
        
        # Validate cart_id
        if cart_id <= 0:
            raise HTTPException(
                status_code=400,
                detail="Invalid cart_id"
            )
        
        # Extract fields từ config_data
        cart_position = config_data.get("cart_position")
        cart_state = config_data.get("cart_state") 
        cart_voice_cmd = config_data.get("cart_voice_cmd")
        cart_ota = config_data.get("cart_ota")
        cam_stream_url = config_data.get("cam_stream_url")
        
        # Upsert vào database
        success = CartConfigRepo.upsert(
            cart_id=cart_id,
            cart_position=cart_position,
            cart_state=cart_state,
            cart_voice_cmd=cart_voice_cmd,
            cart_ota=cart_ota,
            cam_stream_url=cam_stream_url
        )
        
        if not success:
            raise HTTPException(
                status_code=500,
                detail="Failed to update cart configuration"
            )
        
        print(f"Cart config updated for cart_id: {cart_id}")
        
        # Trả về config mới
        return CartConfigRepo.get_by_cart_id(cart_id)


class MapBeaconService:
    """
    Map Beacon service cho quản lý vị trí beacon để định vị.
    """
    
    @staticmethod
    def get_map_beacons(map_id: int) -> Dict[str, Any]:
        """Lấy tất cả beacon của map_id"""
        beacons = MapBeaconRepo.get_by_map_id(map_id)
        
        if not beacons:
            raise HTTPException(
                status_code=404,
                detail=f"No beacons found for map_id: {map_id}"
            )
        
        print(f"Map beacons retrieved for map_id: {map_id}, count: {len(beacons)}")
        return {
            "map_id": map_id,
            "beacons": beacons
        }
    
    @staticmethod
    def get_beacon_config(map_id: int, beacon_id: str) -> Dict[str, Any]:
        """Lấy thông tin cấu hình của 1 beacon cụ thể"""
        beacon = MapBeaconRepo.get_by_map_and_beacon(map_id, beacon_id)
        
        if not beacon:
            raise HTTPException(
                status_code=404,
                detail=f"Beacon not found for map_id: {map_id}, beacon_id: {beacon_id}"
            )
        
        print(f"Beacon config retrieved for map_id: {map_id}, beacon_id: {beacon_id}")
        return beacon
    
    @staticmethod
    def update_beacon_config(map_id: int, beacon_id: str, beacon_data: Dict[str, Any]) -> Dict[str, Any]:
        """Cập nhật hoặc tạo mới cấu hình beacon"""
        
        # Validate map_id và beacon_id
        if map_id <= 0:
            raise HTTPException(
                status_code=400,
                detail="Invalid map_id"
            )
        
        if not beacon_id or len(beacon_id.strip()) == 0:
            raise HTTPException(
                status_code=400,
                detail="Invalid beacon_id"
            )
        
        # Extract fields từ beacon_data
        beacon_blea_uuid = beacon_data.get("beacon_blea_uuid")
        beacon_x_coordinate = beacon_data.get("beacon_x_coordinate")
        beacon_y_coordinate = beacon_data.get("beacon_y_coordinate")
        beacon_D0 = beacon_data.get("beacon_D0")
        beacon_n = beacon_data.get("beacon_n")
        
        # Upsert vào database
        success = MapBeaconRepo.upsert(
            map_id=map_id,
            beacon_id=beacon_id,
            beacon_blea_uuid=beacon_blea_uuid,
            beacon_x_coordinate=beacon_x_coordinate,
            beacon_y_coordinate=beacon_y_coordinate,
            beacon_D0=beacon_D0,
            beacon_n=beacon_n
        )
        
        if not success:
            raise HTTPException(
                status_code=500,
                detail="Failed to update beacon configuration"
            )
        
        print(f"Beacon config updated for map_id: {map_id}, beacon_id: {beacon_id}")
        
        # Trả về config mới
        return MapBeaconRepo.get_by_map_and_beacon(map_id, beacon_id)
