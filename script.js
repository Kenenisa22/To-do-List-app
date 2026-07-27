(function(){
  // ----- STATE -----
  let tasks = [];
  let currentFilter = 'all'; // 'all', 'active', 'completed'

  // DOM refs
  const taskInput = document.getElementById('taskInput');
  const addBtn = document.getElementById('addBtn');
  const taskList = document.getElementById('taskList');
  const totalCount = document.getElementById('totalCount');
  const completedCount = document.getElementById('completedCount');
  const pendingCount = document.getElementById('pendingCount');
  const filterBtns = document.querySelectorAll('.filter-btn');
  const clearCompletedBtn = document.getElementById('clearCompletedBtn');
  const deleteAllBtn = document.getElementById('deleteAllBtn');
  const sortAlphaBtn = document.getElementById('sortAlphaBtn');

  // ----- helper functions -----
  function generateId() {
    return Date.now() + '-' + Math.random().toString(36).substr(2, 6);
  }

  // ----- load from localStorage -----
  function loadTasks() {
    const stored = localStorage.getItem('todoTasks');
    if (stored) {
      try {
        tasks = JSON.parse(stored);
        // ensure each task has an id (migrate old)
        tasks = tasks.map(t => ({ ...t, id: t.id || generateId() }));
      } catch (e) { tasks = []; }
    } else {
      // initial demo tasks
      tasks = [
        { id: generateId(), text: 'Learn HTML', completed: false },
        { id: generateId(), text: 'Practice CSS', completed: false },
        { id: generateId(), text: 'Build Portfolio Website', completed: true },
        { id: generateId(), text: 'Learn JavaScript', completed: false },
      ];
    }
    saveTasks();
  }

  function saveTasks() {
    localStorage.setItem('todoTasks', JSON.stringify(tasks));
  }

  // ----- render based on filter -----
  function render() {
    const filtered = getFilteredTasks();
    taskList.innerHTML = '';

    if (filtered.length === 0) {
      const empty = document.createElement('li');
      empty.className = 'empty-message';
      empty.textContent = currentFilter === 'all' ? 'No tasks yet. Add one!' :
                          currentFilter === 'active' ? 'No pending tasks 🎉' : 'No completed tasks.';
      taskList.appendChild(empty);
    } else {
      filtered.forEach(task => {
        const li = document.createElement('li');
        li.className = `task-item ${task.completed ? 'completed' : ''}`;
        li.dataset.id = task.id;

        // text span
        const textSpan = document.createElement('span');
        textSpan.className = 'task-text';
        textSpan.textContent = task.text;

        // actions container
        const actionsDiv = document.createElement('div');
        actionsDiv.className = 'task-actions';

        // complete toggle
        const toggleBtn = document.createElement('button');
        toggleBtn.className = 'complete-toggle';
        toggleBtn.innerHTML = task.completed ? '<i class="fas fa-circle-check"></i>' : '<i class="far fa-circle"></i>';
        toggleBtn.title = task.completed ? 'Mark as pending' : 'Mark as completed';
        toggleBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          toggleComplete(task.id);
        });

        // edit button
        const editBtn = document.createElement('button');
        editBtn.className = 'edit-btn';
        editBtn.innerHTML = '<i class="fas fa-pen"></i>';
        editBtn.title = 'Edit task';
        editBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          editTask(task.id);
        });

        // delete button
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'delete-btn';
        deleteBtn.innerHTML = '<i class="fas fa-trash-can"></i>';
        deleteBtn.title = 'Delete task';
        deleteBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          deleteTask(task.id);
        });

        actionsDiv.appendChild(toggleBtn);
        actionsDiv.appendChild(editBtn);
        actionsDiv.appendChild(deleteBtn);

        li.appendChild(textSpan);
        li.appendChild(actionsDiv);

        // click on whole item toggles complete (optional, but friendly)
        li.addEventListener('click', (e) => {
          // avoid if click inside actions
          if (e.target.closest('.task-actions')) return;
          toggleComplete(task.id);
        });

        taskList.appendChild(li);
      });
    }
    updateStats();
  }

  function getFilteredTasks() {
    if (currentFilter === 'all') return tasks;
    if (currentFilter === 'active') return tasks.filter(t => !t.completed);
    if (currentFilter === 'completed') return tasks.filter(t => t.completed);
    return tasks;
  }

  function updateStats() {
    const total = tasks.length;
    const comp = tasks.filter(t => t.completed).length;
    const pend = total - comp;
    totalCount.textContent = total;
    completedCount.textContent = comp;
    pendingCount.textContent = pend;
  }

  // ----- CRUD -----
  function addTask() {
    const text = taskInput.value.trim();
    if (text === '') {
      alert('Task cannot be empty.');
      return;
    }
    // duplicate check (case-insensitive)
    const duplicate = tasks.some(t => t.text.toLowerCase() === text.toLowerCase());
    if (duplicate) {
      alert('Task already exists.');
      return;
    }
    const newTask = { id: generateId(), text, completed: false };
    tasks.push(newTask);
    saveTasks();
    render();
    taskInput.value = '';
    taskInput.focus();
  }

  function deleteTask(id) {
    tasks = tasks.filter(t => t.id !== id);
    saveTasks();
    render();
  }

  function toggleComplete(id) {
    const task = tasks.find(t => t.id === id);
    if (task) {
      task.completed = !task.completed;
      saveTasks();
      render();
    }
  }

  function editTask(id) {
    const task = tasks.find(t => t.id === id);
    if (!task) return;
    const newText = prompt('Edit task:', task.text);
    if (newText === null) return; // cancel
    const trimmed = newText.trim();
    if (trimmed === '') {
      alert('Task cannot be empty.');
      return;
    }
    // duplicate check (ignore itself)
    const duplicate = tasks.some(t => t.id !== id && t.text.toLowerCase() === trimmed.toLowerCase());
    if (duplicate) {
      alert('Task already exists.');
      return;
    }
    task.text = trimmed;
    saveTasks();
    render();
  }

  function clearCompleted() {
    tasks = tasks.filter(t => !t.completed);
    saveTasks();
    render();
  }

  function deleteAll() {
    if (tasks.length === 0) return;
    if (confirm('Delete all tasks?')) {
      tasks = [];
      saveTasks();
      render();
    }
  }

  function sortAlphabetically() {
    tasks.sort((a, b) => a.text.localeCompare(b.text));
    saveTasks();
    render();
  }

  // ----- filter change -----
  function setFilter(filter) {
    currentFilter = filter;
    filterBtns.forEach(btn => {
      btn.classList.toggle('active', btn.dataset.filter === filter);
    });
    render();
  }

  // ----- event listeners -----
  addBtn.addEventListener('click', addTask);

  taskInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTask();
    }
  });

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      setFilter(btn.dataset.filter);
    });
  });

  clearCompletedBtn.addEventListener('click', clearCompleted);
  deleteAllBtn.addEventListener('click', deleteAll);
  sortAlphaBtn.addEventListener('click', sortAlphabetically);

  // ----- init -----
  loadTasks();
  render();
  setFilter('all'); // ensure active filter UI

  // extra: if input empty, focus
  taskInput.focus();
})();