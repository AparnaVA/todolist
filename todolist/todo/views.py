from django import forms
from django.shortcuts import redirect, render

from todo.forms import TaskForm
from .models import Task

def create_todo(request):
    if request.method == "POST":
        form = TaskForm(request.POST)
        if form.is_valid():
            form.save()
            return redirect("todo_list")
    else:
        form = TaskForm()
    return render(request, "todo_form.html", {"form": form})

def todo_list(request):
    todos = Task.objects.all()
    return render(request, "todo_list.html", {"todos": todos})

def update_todo(request, pk):
    todo = Task.objects.get(pk=pk)
    if request.method == "POST":
        form = TaskForm(request.POST, instance=todo)
        if form.is_valid():
            form.save()
            return redirect("todo_list")
    else:
        form = TaskForm(instance=todo)
    return render(request, "todo_form.html", {"form": form})

def delete_todo(request, pk):
    todo = Task.objects.get(pk=pk)
    if request.method == "POST":
        todo.delete()
        return redirect("todo_list")
    return render(request, "todo_confirm_delete.html", {"todo": todo})
