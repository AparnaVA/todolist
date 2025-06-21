const TASKS_PER_PAGE = 4;
let tasks = [];
let currentPage = 1;

function renderTasks() {
  const todoList = document.getElementById('todo-list');
  todoList.innerHTML = '';

  const start = (currentPage - 1) * TASKS_PER_PAGE;
  const end = start + TASKS_PER_PAGE;
  const pageTasks = tasks.slice(start, end);

  pageTasks.forEach((task, idx) => {
    const li = document.createElement('li');
    if (task.completed) li.classList.add('completed');

    const span = document.createElement('span');
    span.className = 'todo-text';
    span.textContent = task.text;

    li.appendChild(span);

    const actions = document.createElement('div');
    actions.className = 'todo-actions';

    // Complete button
    const completeBtn = document.createElement('button');
    completeBtn.className = 'action-btn complete';
    completeBtn.title = 'Mark as Complete';
    completeBtn.innerHTML = '✔';
    completeBtn.onclick = function () {
      task.completed = !task.completed;
      renderTasks();
    };
    actions.appendChild(completeBtn);

    // Edit button
    const editBtn = document.createElement('button');
    editBtn.className = 'action-btn edit';
    editBtn.title = 'Edit Task';
    editBtn.innerHTML = '✎';
    editBtn.onclick = function () {
      if (li.classList.contains('completed')) return;
      if (editBtn.innerHTML === '✎') {
        const editInput = document.createElement('input');
        editInput.type = 'text';
        editInput.value = task.text;
        editInput.className = 'todo-text';
        li.replaceChild(editInput, span);
        editBtn.innerHTML = '💾';
        editInput.focus();
        editInput.onkeydown = function(e) {
          if (e.key === 'Enter') editBtn.click();
        };
      } else {
        const editInput = li.querySelector('input');
        const newText = editInput.value.trim();
        if (newText) {
          task.text = newText;
        }
        li.replaceChild(span, li.querySelector('input'));
        span.textContent = task.text;
        editBtn.innerHTML = '✎';
      }
    };
    actions.appendChild(editBtn);

    // Delete button
    const deleteBtn = document.createElement('button');
deleteBtn.className = 'action-btn delete';
deleteBtn.title = 'Delete Task';
deleteBtn.innerHTML = '🗑';
deleteBtn.onclick = function () {
  showCustomConfirm(() => {
    const globalIdx = start + idx;
    tasks.splice(globalIdx, 1);
    if (currentPage > 1 && start >= tasks.length) {
      currentPage--;
    }
    renderTasks();
  });
};
actions.appendChild(deleteBtn);

    li.appendChild(actions);
    todoList.appendChild(li);
  });

  renderPagination();
}

function showCustomConfirm(onYes) {
  const modal = document.getElementById('custom-confirm');
  modal.style.display = 'flex';
  document.getElementById('confirm-yes').onclick = function() {
    modal.style.display = 'none';
    onYes();
  };
  document.getElementById('confirm-no').onclick = function() {
    modal.style.display = 'none';
  };
}

function renderPagination() {
  let pagination = document.getElementById('pagination');
  if (!pagination) {
    pagination = document.createElement('div');
    pagination.id = 'pagination';
    pagination.style.display = 'flex';
    pagination.style.justifyContent = 'center';
    pagination.style.gap = '10px';
    pagination.style.marginTop = '16px';
    document.querySelector('.container').appendChild(pagination);
  }
  pagination.innerHTML = '';

  const totalPages = Math.ceil(tasks.length / TASKS_PER_PAGE);
  if (totalPages <= 1) {
    pagination.style.display = 'none';
    return;
  }
  pagination.style.display = 'flex';

  const prevBtn = document.createElement('button');
  prevBtn.textContent = 'Prev';
  prevBtn.disabled = currentPage === 1;
  prevBtn.onclick = function () {
    if (currentPage > 1) {
      currentPage--;
      renderTasks();
    }
  };
  pagination.appendChild(prevBtn);

  for (let i = 1; i <= totalPages; i++) {
    const pageBtn = document.createElement('button');
    pageBtn.textContent = i;
    if (i === currentPage) {
      pageBtn.style.background = '#a78bfa';
      pageBtn.style.color = '#fff';
      pageBtn.style.fontWeight = 'bold';
    }
    pageBtn.onclick = function () {
      currentPage = i;
      renderTasks();
    };
    pagination.appendChild(pageBtn);
  }

  const nextBtn = document.createElement('button');
  nextBtn.textContent = 'Next';
  nextBtn.disabled = currentPage === totalPages;
  nextBtn.onclick = function () {
    if (currentPage < totalPages) {
      currentPage++;
      renderTasks();
    }
  };
  pagination.appendChild(nextBtn);
}

function addTodo() {
  const input = document.getElementById('todo-input');
  const text = input.value.trim();
  if (!text) return;
  tasks.push({ text, completed: false });
  input.value = '';
  currentPage = Math.ceil(tasks.length / TASKS_PER_PAGE); // Go to last page
  renderTasks();
}

document.getElementById('todo-input').addEventListener('keydown', function(e) {
  if (e.key === 'Enter') addTodo();
});

renderTasks();