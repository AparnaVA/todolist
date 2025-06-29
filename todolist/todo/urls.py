from django.urls import path, include

from todo import views




urlpatterns = [
    path('create/', views.create_todo, name='create_todo'),
    path('list/', views.todo_list, name='todo_list'),
    path('update/<int:pk>/', views.update_todo, name='update_todo'),
    path('delete/<int:pk>/', views.delete_todo, name='delete_todo'),
]