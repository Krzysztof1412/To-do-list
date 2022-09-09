'use strict';
window.onload = start;
const popUp = document.querySelector('.task-popup');
const insertName = document.querySelector('.insert-name');
const insertDescription = document.querySelector('.insert-description');
let taskOrder = 1000;
let darkModeOff = true;
let shiftX;
let shiftY;
function start() {
  addListeners();
}

const addListeners = function () {
  const buttons = document.querySelectorAll('.popUp-button');
  const submitButton = document.querySelector('.submit-task');

  let clickedButton;
  let popUpOpened = false;

  buttons.forEach(btn => {
    btn.addEventListener('click', function (e) {
      e.preventDefault();
      if (!popUpOpened) clickedButton = this.id;
      popUpOpened = !popUpOpened;
      popUp.classList.toggle('hidden');
      insertName.classList.add('hidden');
      insertDescription.classList.add('hidden');
    });
  });

  submitButton.addEventListener('click', function (e) {
    e.preventDefault();
    let container;
    switch (clickedButton) {
      case 'done-task':
        container = document.getElementById('done-container');
        break;
      case 'progress-task':
        container = document.getElementById('progress-container');
        break;
      case 'queue-task':
        container = document.getElementById('queue-container');
        break;
    }
    let name = document.querySelector('#task-name');
    let description = document.querySelector('#task-description');

    if (!name.value) insertName.classList.remove('hidden');
    else insertName.classList.add('hidden');
    if (!description.value) insertDescription.classList.remove('hidden');
    else insertDescription.classList.add('hidden');

    if (name.value && description.value) {
      insertName.classList.add('hidden');
      insertDescription.classList.add('hidden');

      const element = document.createElement('div');

      let borderInterval;

      const html = `
        <h3>${name.value}</h3>
        <p>${description.value}</p>
        <div class='close-task'><i class="fas fa-times"></i></div>
      `;

      element.insertAdjacentHTML('afterbegin', html);

      container.appendChild(element);
      element.classList.add('task');
      name.value = description.value = '';
      const popUp = document.querySelector('.task-popup');
      popUp.classList.toggle('hidden');
      popUpOpened = false;

      let offsetX = element.getBoundingClientRect().left;
      let offsetY = element.getBoundingClientRect().top;

      let closestContainer;
      let currentTaskTop;

      function onDrag(e) {
        element.classList.add('hidden');
        if (
          /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
            navigator.userAgent
          )
        ) {
          // //console.log(
          //   document.elementFromPoint(
          //     e.changedTouches[0].clientX,
          //     e.changedTouches[0].clientY
          //   )
          // );
          closestContainer = document
            .elementFromPoint(
              e.changedTouches[0].clientX,
              e.changedTouches[0].clientY
            )
            .closest('.droppable');
        } else {
          closestContainer = document
            .elementFromPoint(e.clientX, e.clientY)
            .closest('.droppable');
        }

        element.classList.remove('hidden');
        currentTaskTop = element.getBoundingClientRect().top;

        let getStyle = window.getComputedStyle(element);
        let left = parseInt(getStyle.left);
        let top = parseInt(getStyle.top);

        if (
          /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
            navigator.userAgent
          )
        ) {
          element.style.left = `${e.changedTouches[0].pageX - shiftX}px`;
          element.style.top = `${e.changedTouches[0].pageY - shiftY}px`;
          //console.log(e);
        } else {
          element.style.left = `${left + e.movementX}px`;
          element.style.top = `${top + e.movementY}px`;
        }
      }

      const dragEnd = function (e) {
        document.body.style.overflowX = 'auto';
        document.documentElement.style.overflowX = 'auto';
        clearInterval(borderInterval);
        document.removeEventListener('mousemove', onDrag);
        document.removeEventListener('touchmove', onDrag);
        if (!closestContainer) {
          const taskOrder = +element.style.order;
          element.classList.remove('task-draggable');
          element.style = `order: ${taskOrder}`;
          offsetX = offsetY = 0;
          document.removeEventListener('mouseup', dragEnd);
          document.removeEventListener('touchend', dragEnd);
          element.classList.remove('task-draggable');
          return;
        }
        let allTasks = document.querySelectorAll(
          `#${closestContainer.id} .task`
        );
        let firstTask = element;
        element.style.order = 9999999999;
        allTasks.forEach(task => {
          if (+firstTask.style.order > +task.style.order) firstTask = task;
        });
        if (
          element.getBoundingClientRect().top <
          firstTask.getBoundingClientRect().top
        ) {
          offsetX = offsetY = 0;
          element.style = '';
          closestContainer.appendChild(element);
          document.removeEventListener('mouseup', dragEnd);
          document.removeEventListener('touchend', dragEnd);
          element.classList.remove('task-draggable');
          element.style.order = firstTask.style.order - 1;
        } else {
          offsetX = offsetY = 0;
          element.style = '';

          element.classList.add('hidden');
          let closestTask;
          if (
            /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
              navigator.userAgent
            )
          ) {
            closestTask = document
              .elementFromPoint(e.changedTouches[0].clientX, currentTaskTop)
              .closest('.task');
          } else {
            closestTask = document
              .elementFromPoint(e.clientX, currentTaskTop)
              .closest('.task');
          }
          element.classList.remove('hidden');

          let orderSum = Array.from(allTasks).reduce(
            (acc, task) => acc + Number(task.style.order),
            0
          );

          element.style.order = closestTask
            ? +closestTask.style.order + 1
            : orderSum + 1000;

          let currentElementOrder = +element.style.order;

          for (let task of allTasks) {
            if (currentTaskTop < task.getBoundingClientRect().top) {
              task.style.order++;
            }
          }
          element.style.order = currentElementOrder;

          closestContainer.appendChild(element);
          document.removeEventListener('mouseup', dragEnd);
          document.removeEventListener('touchend', dragEnd);
          element.classList.remove('task-draggable');
        }
      };

      element.style.order = taskOrder = taskOrder + 2;

      const dragStart = function (e) {
        if (
          /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
            navigator.userAgent
          )
        ) {
          shiftX =
            e.changedTouches[0].clientX - element.getBoundingClientRect().left;
          shiftY =
            e.changedTouches[0].clientY - element.getBoundingClientRect().top;
        }
        document.body.style.overflowX = 'hidden';
        document.documentElement.style.overflowX = 'hidden';
        let docHeight = document.body.clientHeight;
        let pointY = element.getBoundingClientRect().top + window.scrollY;
        const taskOrder = +element.style.order;
        element.style = `top: ${
          pointY - 2
        }px; position: absolute; order: ${taskOrder}`;
        element.classList.add('task-draggable');
        document.addEventListener('mouseup', dragEnd);
        document.addEventListener('touchend', dragEnd);
        document.addEventListener('mousemove', onDrag);
        document.addEventListener('touchmove', onDrag);

        borderInterval = setInterval(function () {
          if (
            window.parseInt(element.style.top) >
            window.innerHeight + window.scrollY - element.clientHeight - 10
          ) {
            let top = window.parseInt(element.style.top) + 5;
            if (window.innerHeight + window.scrollY >= docHeight) {
              window.scrollTo(0, window.scrollY);
            } else {
              element.style.top = `${top}px`;
              window.scrollTo(0, window.scrollY + 5);
            }
          }
          if (window.parseInt(element.style.top) < window.scrollY) {
            let top = window.parseInt(element.style.top) - 5;
            if (window.parseInt(element.style.top) < 0) {
              window.scrollTo(0, window.scrollY - 5);
            } else {
              element.style.top = `${top}px`;
              window.scrollTo(0, window.scrollY - 5);
            }
          }
        }, 10);
      };

      element.addEventListener('touchstart', dragStart);
      element.addEventListener('mousedown', dragStart);

      if (!darkModeOff) element.classList.add('dark-mode-task');

      let allCloseTasks = document.querySelectorAll('.task .close-task');
      const closeTask = function (e) {
        e.stopPropagation();
        this.parentNode.parentNode?.removeChild(this.parentNode);
      };
      allCloseTasks.forEach(close => {
        close.addEventListener('mousedown', closeTask, { once: true });
      });
    }
  });

  const switchButton = document.querySelector('#toggle');
  switchButton.addEventListener('change', function () {
    darkModeOff = !darkModeOff;
    document.body.classList.toggle('dark-mode-body');
    const droppable = document.querySelectorAll('.droppable');
    droppable.forEach(el => el.classList.toggle('dark-mode'));

    const formElements = document.querySelectorAll(
      '#task-name, #task-description'
    );
    formElements.forEach(el => el.classList.toggle('dark-mode'));

    const form = document.querySelector('form');
    form.classList.toggle('dark-mode-body');

    const allTasks = document.querySelectorAll('.task');
    allTasks.forEach(el => {
      el.classList.toggle('dark-mode-task');
    });
  });
};
