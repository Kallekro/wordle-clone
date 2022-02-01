from django.db import models
from .word_data import words
from random import choice
import uuid

# Create your models here.

class Game(models.Model):
    def random_solution():
        return choice(words)

    solution = models.CharField(max_length=5, default=random_solution)
    game_id = models.UUIDField(default=uuid.uuid4)