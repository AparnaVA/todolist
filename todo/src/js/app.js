const TASKS_PER_PAGE = 4;
let tasks = JSON.parse(localStorage.getItem('tasks') || '[]');
let currentPage = 1;

let currentFilter = 'all';
document.getElementById('filter-tasks').addEventListener('change', function() {
  currentFilter = this.value;
  currentPage = 1; // Reset to first page on filter change
  renderTasks();
});

function renderTasks() {
  const todoList = document.getElementById('todo-list');
  todoList.innerHTML = '';

  tasks.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));

  let filteredTasks = tasks;
  if (currentFilter === 'pending') {
    filteredTasks = tasks.filter(task => !task.completed);
  } else if (currentFilter === 'completed') {
    filteredTasks = tasks.filter(task => task.completed);
  }

  const start = (currentPage - 1) * TASKS_PER_PAGE;
  const end = start + TASKS_PER_PAGE;
  const pageTasks = filteredTasks.slice(start, end);

  pageTasks.forEach((task, idx) => {
    const li = document.createElement('li');
    if (task.completed) li.classList.add('completed');

    const span = document.createElement('span');
    span.className = 'todo-text';
    span.textContent = task.text;

    // Due date display
const due = document.createElement('span');
due.textContent = `Due: ${task.dueDate}`;
due.style.marginLeft = "1.2rem";
due.style.fontSize = "1rem";
due.style.fontFamily = "Poppins, Arial, sans-serif";
due.style.padding = "2px 10px";
due.style.borderRadius = "8px";
due.style.fontWeight = "bold";
due.style.letterSpacing = "1px";
due.style.color = "#fff";

// Color logic
const today = new Date();
const dueDateObj = new Date(task.dueDate);
const diffDays = Math.ceil((dueDateObj - today) / (1000 * 60 * 60 * 24));

if (diffDays < 0) {
  // Overdue
  due.style.color = "#ef4444"; // Red
  //make it bold
  due.style.fontWeight = "bold";
} else if (diffDays === 0) {
  // Due today
  due.style.color = "#f59e42"; // Orange
  due.style.fontWeight = "bold";
} else if (diffDays <= 3) {
  // Due soon (within 3 days)
  due.style.color = "#fbbf24"; // Yellow
  due.style.fontWeight = "bold";
} else if (diffDays <= 7) {
  // Moderate (within a week)
  due.style.color = "#38bdf8"; // Blue
  due.style.fontWeight = "normal";
} else {
  // Not urgent
  due.style.color = "#7c3aed"; // Violet
  due.style.fontWeight = "bold";
}


    li.appendChild(span);
    li.appendChild(due);

    const actions = document.createElement('div');
    actions.className = 'todo-actions';

    // Complete button
    const completeBtn = document.createElement('button');
    completeBtn.className = 'action-btn complete';
    completeBtn.title = 'Mark as Complete';
    completeBtn.innerHTML = '✔';
    completeBtn.onclick = function () {
      task.completed = !task.completed;
      saveTasks();
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
        saveTasks();
        renderTasks();
        // Show success toast
        const toast = document.getElementById('liveToast');
        const bsToast = new bootstrap.Toast(toast);
        bsToast.show();
        const toastBody = document.querySelector('.toast-body');
        toastBody.textContent = 'Task updated successfully!';
        toastBody.style.fontFamily = 'Poppins, Arial, sans-serif';
        toastBody.style.fontSize = '1rem';
        toastBody.style.color = '#fff';
        toastBody.style.backgroundColor = '#4ade80'; // Green background
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
        saveTasks();
        renderTasks();
           //how to change the text of the toast message
  const toast = document.getElementById('liveToast');
    const bsToast = new bootstrap.Toast(toast);
    bsToast.show();
     const toastBody = document.querySelector('.toast-body');
  toastBody.textContent = 'Task deleted successfully!';
  toastBody.style.fontFamily = 'Poppins, Arial, sans-serif';
  toastBody.style.fontSize = '1rem';
  toastBody.style.color = '#fff';
  toastBody.style.backgroundColor = '#ef4444'; // Red background
      });
    };
    actions.appendChild(deleteBtn);

    li.appendChild(actions);
    todoList.appendChild(li);
  });



  renderPagination();
}
function exportTasks(format) {
  if (format === 'json') {
    const jsonData = JSON.stringify(tasks, null, 2);
    const blob = new Blob([jsonData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'tasks.json';
    a.click();
    URL.revokeObjectURL(url);
  }

  else if (format === 'csv') {
    const csvRows = [];
    csvRows.push(['Task', 'Completed', 'Due Date'].join(','));
    tasks.forEach(task => {
      const row = [
        `"${task.text.replace(/"/g, '""')}"`,
        task.completed ? 'Yes' : 'No',
        task.dueDate
      ].join(',');
      csvRows.push(row);
    });
    const csvData = csvRows.join('\n');
    const blob = new Blob([csvData], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'tasks.csv';
    a.click();
    URL.revokeObjectURL(url);
  }

  else if (format === 'sql') {
    const sqlRows = [];
    sqlRows.push('CREATE TABLE tasks (id INTEGER PRIMARY KEY AUTOINCREMENT, text TEXT, completed BOOLEAN, due_date TEXT);');
    tasks.forEach((task, index) => {
      const completed = task.completed ? 1 : 0;
      const row = `INSERT INTO tasks (id, text, completed, due_date) VALUES (${index + 1}, "${task.text.replace(/"/g, '""')}", ${completed}, "${task.dueDate}");`;
      sqlRows.push(row);
    });
    const sqlData = sqlRows.join('\n');
    const blob = new Blob([sqlData], { type: 'application/sql' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'tasks.sql';
    a.click();
    URL.revokeObjectURL(url);
  }

  else if (format === 'txt') {
    const txtRows = [];
    tasks.forEach(task => {
      const completed = task.completed ? '✔' : '✘';
      txtRows.push(`${completed} ${task.text} (Due: ${task.dueDate})`);
    });
    const txtData = txtRows.join('\n');
    const blob = new Blob([txtData], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'tasks.txt';
    a.click();
    URL.revokeObjectURL(url);
  }

  else {
    console.warn("Unsupported format:", format);
  }
}


function saveTasks() {
  localStorage.setItem('tasks', JSON.stringify(tasks));
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
    pagination.style.marginTop = '40px';

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
  const dateInput = document.getElementById('due-date-input');
  if (!input.value.trim() && !dateInput.value) {
    //add a bootstrap toast message
    const toast = document.getElementById('liveToast');
    const bsToast = new bootstrap.Toast(toast);
    bsToast.show();
    //change the text of the toast message
    const toastBody = document.querySelector('.toast-body');
    toastBody.textContent = 'Please enter a task and a due date.';
    toastBody.style.fontFamily = 'Poppins, Arial, sans-serif';
    toastBody.style.fontSize = '1rem';
    toastBody.style.color = '#fff';
    toastBody.style.backgroundColor = '#f87171'; // Red background
    return;
  }
  else if (!dateInput.value) {
    //add a bootstrap toast message
    const toast = document.getElementById('liveToast');
    const bsToast = new bootstrap.Toast(toast);
    bsToast.show();
    //change the text of the toast message
    const toastBody = document.querySelector('.toast-body');
    toastBody.textContent = 'Please enter a due date.';
    toastBody.style.fontFamily = 'Poppins, Arial, sans-serif';
    toastBody.style.fontSize = '1rem';
    toastBody.style.color = '#fff';
    toastBody.style.backgroundColor = '#f87171'; // Red background
    return;
  }
  else{
    const toast = document.getElementById('liveToast');
    const bsToast = new bootstrap.Toast(toast);
    bsToast.show();
     const toastBody = document.querySelector('.toast-body');
  toastBody.textContent = 'Task added successfully!';
  toastBody.style.fontFamily = 'Poppins, Arial, sans-serif';
  toastBody.style.fontSize = '1rem';
  toastBody.style.color = '#fff';
  toastBody.style.backgroundColor = '#4ade80'; // Green background
  }
  
  const text = input.value.trim();
  const dueDate = dateInput.value;
  if (!text || !dueDate) return;
  tasks.push({ text, completed: false, dueDate });
  input.value = '';
  dateInput.value = '';
  currentPage = Math.ceil(tasks.length / TASKS_PER_PAGE);
  saveTasks();
  renderTasks();
}

document.getElementById('todo-input').addEventListener('keydown', function(e) {
  if (e.key === 'Enter') addTodo();
});

renderTasks();


//add importTasks function for  csv,json,sql and text files
function importTasks(file) {
  const reader = new FileReader();
  reader.onload = function(event) {
    const content = event.target.result;
    let tasksToImport = [];
    if (file.type === 'application/json') {
      tasksToImport = JSON.parse(content);
    } else if (file.type === 'text/csv') {
      //remove double quotes and heading from the content
      const cleanedContent = content.replace(/"/g, '');
      const rows = cleanedContent.split('\n').slice(1); // Remove header
      tasksToImport = rows.map(row => {
        const [text, completed, dueDate] = row.split(',');
        return { text, completed: completed === 'true', dueDate };
      });
    }
    //add functionality to import sql
    else if (file.type === 'application/sql' || file.name.endsWith('.sql')) {
  // Find all INSERT INTO statements
  const insertRegex = /INSERT INTO tasks\s*\(.*?\)\s*VALUES\s*\((.*?)\);/gi;
  let match;
  while ((match = insertRegex.exec(content)) !== null) {
    // Split values by comma, handling quoted strings
    // Example: 1, "Task text", 1, "2024-07-01"
    const values = match[1]
      .split(/,(?=(?:[^"]*"[^"]*")*[^"]*$)/)
      .map(v => v.trim().replace(/^"|"$/g, '').replace(/""/g, '"'));
    // values: [id, text, completed, due_date]
    if (values.length >= 4) {
      tasksToImport.push({
        text: values[1],
        completed: values[2] === '1' || values[2].toLowerCase() === 'true',
        dueDate: values[3]
      });
    }
  }
}

     else if (file.type ==='text/plain') {
      //do not replace due date
      const rows = content.split('\n').filter(row => row.trim() !== '')
      //avoid tick and cross marks
      .map(row => row.replace(/✔/g, '').replace(/✘/g, '').trim());
      tasksToImport = rows.map(row => {
        const parts = row.split(' (Due: ');
        const text = parts[0].trim();
        const dueDate = parts[1] ? parts[1].replace(')', '').trim() : '';
        return { text, completed: row.startsWith('✔'), dueDate };
      });
    
    } else {
      console.error('Unsupported file type');
      return;
    }
    tasks.push(...tasksToImport);
    saveTasks();
    renderTasks();
  };
  reader.readAsText(file);
}