import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.test')
django.setup()
from django.core.management import call_command
call_command('migrate', verbosity=0)

from django.contrib.auth import get_user_model
from django.db.models import Count, OuterRef, Subquery, IntegerField
from django.db.models.functions import Coalesce
from boards.models import Board, Column, Card

User = get_user_model()
u = User.objects.create(username="testdb")
b = Board.objects.create(owner=u, title="b1")
c1 = Column.objects.create(board=b, title="col1", order=1.0)
c2 = Column.objects.create(board=b, title="col2", order=2.0)
Card.objects.create(column=c1, title="c11", order=1.0)
Card.objects.create(column=c2, title="c21", order=1.0)
Card.objects.create(column=c2, title="c22", order=2.0)


completed_cards_subquery = Column.objects.filter(
    board_id=OuterRef('pk')
).order_by('-order').annotate(
    cnt=Count('cards')
).values('cnt')[:1]

qs = Board.objects.filter(owner=u).annotate(
    completed_cards_count_annotated=Coalesce(
        Subquery(completed_cards_subquery, output_field=IntegerField()), 
        0
    )
)

b_res = qs.first()
print("COMPLETED:", b_res.completed_cards_count_annotated)
