from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions, status
from rest_framework.request import Request
from typing import Optional

from ..selectors import user_search_list
from ..serializers.user_serializers import UserSearchSerializer 

class UserSearchView(APIView):
    """
    Vista para búsqueda de usuarios.
    Delegación pura en la capa de selectores para lógica de filtrado.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request: Request) -> Response:
        # 1. Extracción y tipado de parámetros
        query: str = str(request.query_params.get('q', ''))
        board_id_raw = request.query_params.get('board_id')
        
        # 2. Validación de parámetros de entrada
        board_id: Optional[int] = None
        if board_id_raw and str(board_id_raw).isdigit():
            board_id = int(board_id_raw)

        # 3. Obtención de datos vía Selector
        try:
            users = user_search_list(
                query=query, 
                exclude_board_id=board_id
            )
            
            # 4. Serialización
            serializer = UserSearchSerializer(users, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)
            
        except Exception as e:
            # Loguear el error internamente y devolver una respuesta controlada
            # Aquí podrías usar logger.error(f"Error en búsqueda: {e}")
            return Response(
                {"detail": "Error interno al procesar la búsqueda."}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )