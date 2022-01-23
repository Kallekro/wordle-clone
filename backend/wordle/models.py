from django.db import models

# Create your models here.

class Game(models.Model):
    solution = models.CharField(max_length=5)
