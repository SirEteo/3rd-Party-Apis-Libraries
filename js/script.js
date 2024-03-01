// Retrieve tasks and nextId from localStorage
let taskList = JSON.parse(localStorage.getItem("tasks")) || [];
let nextId = JSON.parse(localStorage.getItem("nextId")) || 1;

// Todo: create a function to generate a unique task id
function generateTaskId() {
  return nextId++;
}

// Todo: create a function to create a task card
function createTaskCard(task) {
    const currentDate = dayjs();
    const dueDate = task.dueDate ? dayjs(task.dueDate) : null;
  
    // Determine the color code based on the due date
    let colorClass = '';
    if (dueDate) {
      const daysUntilDue = dueDate.diff(currentDate, 'days');
  
      if (daysUntilDue < 0) {
        colorClass = 'text-danger'; // Overdue (red)
      } else if (daysUntilDue <= 3) {
        colorClass = 'text-warning'; // Nearing the deadline (yellow)
      }
    }
  
    const card = $(`
      <div class="card mb-3 ${colorClass}">
        <div class="card-body">
          <h5 class="card-title">${task.title}</h5>
          <p class="card-text">${task.description}</p>
          <p class="card-text"><strong>Due Date:</strong> ${task.dueDate ? dayjs(task.dueDate).format('YYYY-MM-DD') : 'Not specified'}</p>
          <button class="btn btn-danger btn-sm float-end delete-btn" data-task-id="${task.id}">Delete</button>
        </div>
      </div>
    `);
  
    // Make the card draggable
    card.draggable({
      revert: 'invalid',
      helper: 'clone'
    });
  
    return card;
  }

// Todo: create a function to render the task list and make cards draggable
function renderTaskList() {
  taskList.forEach(task => {
    const lane = $(`#${task.status}-cards`);
    const card = createTaskCard(task);
    lane.append(card);
  });

  // Make cards draggable
  $('.card').draggable({
    revert: 'invalid',
    helper: 'clone'
  });
}

// Todo: create a function to handle adding a new task
function handleAddTask(event) {
  event.preventDefault();

  const taskTitle = $('#taskTitle').val();
  const taskDescription = $('#taskDescription').val();
  const taskDueDate = $('#taskDueDate').val();

  const newTask = {
    id: generateTaskId(),
    title: taskTitle,
    description: taskDescription,
    dueDate: taskDueDate,
    status: 'to-do' // Initial status
  };

  taskList.push(newTask);
  localStorage.setItem("tasks", JSON.stringify(taskList));
  localStorage.setItem("nextId", JSON.stringify(nextId));

  const card = createTaskCard(newTask);
  $('#todo-cards').append(card);

  // Reset the form and close the modal
  $('#taskForm')[0].reset();
  $('#formModal').modal('hide');
}

// Todo: create a function to handle deleting a task
function handleDeleteTask(event) {
  const taskId = $(event.target).data('task-id');
  taskList = taskList.filter(task => task.id !== taskId);

  // Update localStorage
  localStorage.setItem("tasks", JSON.stringify(taskList));

  // Remove the card from the DOM
  $(event.target).closest('.card').remove();
}

// Todo: create a function to handle dropping a task into a new status lane
function handleDrop(event, ui) {
  const taskId = ui.draggable.find('.delete-btn').data('task-id');
  const newStatus = $(event.target).attr('id');

  // Update the task status in the taskList
  const taskIndex = taskList.findIndex(task => task.id === taskId);
  taskList[taskIndex].status = newStatus;

  // Update localStorage
  localStorage.setItem("tasks", JSON.stringify(taskList));
}

// Todo: when the page loads, render the task list, add event listeners, make lanes droppable, and make the due date field a date picker
$(document).ready(function () {
  renderTaskList();

  // Add event listener for the Add Task button
  $('#taskForm').submit(handleAddTask);

  // Add event listener for the Delete button on each task card
  $(document).on('click', '.delete-btn', handleDeleteTask);

  // Make lanes droppable
  $('.lane').droppable({
    accept: '.card',
    drop: handleDrop
  });

  // Make the due date field a date picker using dayjs
  $('#taskDueDate').datepicker({
    dateFormat: 'yy-mm-dd',
    changeMonth: true,
    changeYear: true,
  });
});