import requests
import json

class GeoJSONTransformer:
    def __init__(self,api_url = None):
        self.api_url = api_url

    def transform_to_geojson(self, filename, file, content_type):
        """Transforms an uploaded file to GeoJSON using a POST request.

        Args:
            file: The UploadFile object from FastAPI.

        Returns:
            A dictionary representing the GeoJSON response, or None if an error occurs.
        """
        try:
      
            files = {
                "file": file
            }
            response = requests.post(f"{self.api_url}/geojson", files=files)
      
            response.raise_for_status()  # Raise HTTPError for bad responses (4xx or 5xx)
            print(f"File {filename} transformed successfully.")
            return response.json()
        except requests.exceptions.RequestException as e:
            print(f"Error during GeoJSON transformation: {e}")
            return None
        except json.JSONDecodeError as e:
            print(f"Error decoding JSON response: {e}")
            print(f"Raw response: {response.text}")  # Added to help debug
            return None
        except Exception as e:
            print(f"An unexpected error occurred: {e}")
            return None

    def send_gfw(self, polygon, api_url, token):
        """Transforms an uploaded file to GeoJSON using a POST request.

        Args:
            polygon: GeoJSON polygon to send
            api_url: GFW API base URL
            token: Authorization token

        Returns:
            A dictionary with GFW response including listId, status, data, etc. or None if an error occurs.
        """
        try:
            # Convertir el polygon a FeatureCollection si no lo es ya
            if isinstance(polygon, dict):
                # Si ya es un FeatureCollection, usarlo tal cual
                if polygon.get("type") == "FeatureCollection":
                    feature_collection = polygon
                # Si es una Feature, envolver en FeatureCollection
                elif polygon.get("type") == "Feature":
                    feature_collection = {
                        "type": "FeatureCollection",
                        "features": [polygon]
                    }
                # Si es una geometría (Point, LineString, Polygon, MultiPolygon, etc.), crear Feature y FeatureCollection
                elif polygon.get("type") in ["Point", "LineString", "Polygon", "MultiPolygon", "GeometryCollection"]:
                    feature_collection = {
                        "type": "FeatureCollection",
                        "features": [{
                            "type": "Feature",
                            "geometry": polygon,
                            "properties": {}
                        }]
                    }
                else:
                    # Formato desconocido, intentar enviar tal cual
                    feature_collection = polygon
            else:
                feature_collection = polygon
            
            print(f"🔍 FeatureCollection to send: {feature_collection}")
            headers = {
                "Authorization": token,
                "Content-Type": "application/json"
            }
            
            print(f"📡 Enviando polígono a GFW API...")
            print(f"🔗 URL: {api_url}/v2/upload")
            
            response = requests.post(f"{api_url}/v2/upload", headers=headers, json=feature_collection)
            response.raise_for_status()
            
            data = response.json()
            print(f"✅ Respuesta de GFW recibida: {data}")
            
            # Estructura de respuesta esperada según la documentación
            gfw_response = {
                "listId": data.get("listId"),
                "status": data.get("status", "pending"),
                "errorsDetails": data.get("errorsDetails"),
                "resultUrl": data.get("resultUrl"),
                "creationDate": data.get("creationDate"),
                "expirationDate": data.get("expirationDate"),
                "data": data.get("data", {})
            }
            
            return gfw_response
            
        except requests.exceptions.RequestException as e:
            print(f"❌ Error de red al enviar a GFW: {e}")
            if hasattr(e, 'response') and e.response is not None:
                print(f"📄 Respuesta del servidor: {e.response.text}")
            return None
        except json.JSONDecodeError as e:
            print(f"❌ Error al decodificar respuesta JSON: {e}")
            return None
        except Exception as e:
            print(f"❌ Error inesperado al enviar a GFW: {e}")
            import traceback
            traceback.print_exc()
            return None
    
    def request_validation(self, request_id: str, api_url: str, token: str):
        """Validates and retrieves the status of a GFW deforestation analysis request.

        Args:
            request_id: The listId/uploadId from GFW
            api_url: GFW API base URL
            token: Authorization token

        Returns:
            A dictionary with the validation response including status, resultUrl, data, etc. or None if an error occurs.
        """
        try:
            headers = {
                "Authorization": token,
                "Content-Type": "application/json"
            }
            
            print(f"🔍 Validando solicitud de GFW con ID: {request_id}")
            print(f"🔗 URL: {api_url}/v2/{request_id}")
            
            response = requests.get(
                f"{api_url}/v2/{request_id}",
                headers=headers
            )
            response.raise_for_status()
            
            data = response.json()
            print(f"✅ Validación de GFW recibida: {data}")
            
            # Estructura de respuesta esperada según la documentación
            validation_response = {
                "uploadId": data.get("uploadId", request_id),
                "listId": data.get("listId", request_id),
                "status": data.get("status", "Pending"),
                "resultUrl": data.get("resultUrl", ""),
                "errorDetails": data.get("errorDetails", []),
                "creationDate": data.get("creationDate", ""),
                "expirationDate": data.get("expirationDate", ""),
                "data": data.get("data", {})
            }
            
            return validation_response
            
        except requests.exceptions.RequestException as e:
            print(f"❌ Error de red al validar en GFW: {e}")
            if hasattr(e, 'response') and e.response is not None:
                print(f"📄 Respuesta del servidor: {e.response.text}")
            return None
        except json.JSONDecodeError as e:
            print(f"❌ Error al decodificar respuesta JSON: {e}")
            return None
        except Exception as e:
            print(f"❌ Error inesperado al validar en GFW: {e}")
            import traceback
            traceback.print_exc()
            return None