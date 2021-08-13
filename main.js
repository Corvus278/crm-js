function formNotification(message) {
  const notification = document.querySelector('.form-add').querySelector('.notification')
  notification.textContent = message
  notification.style.display = 'inline-block'
  notification.style.opacity = '1'
  notification.disabled = true
  setTimeout(() => {
    notification.style.opacity = '0'
    setTimeout(() => {
      notification.style.display = 'none'
    }, 300)
  }, 3000)
}

function addTolocalStorage(data) {
  const oldList = localStorage.getItem('students')
  oldList.push(data)
  // localStorage.setItem('students',)
}


document.addEventListener('DOMContentLoaded', () => {
  document.querySelector('.form-add').addEventListener('submit', (e) => {
    e.preventDefault()

    const inputsValues = []
    Array.from(document.querySelector('.form-add').querySelectorAll('input'))
      .forEach((input) => {
        input.type === 'date' ? inputsValues.push({ name: input.name, value: input.valueAsDate }) && console.log(input.valueAsDate) : inputsValues.push({ name: input.name, value: input.value })
      })

    // проверка на валидность
    let message
    inputsValues.forEach(input => {
      if (typeof input.value === 'string') {
        if (input.value.trim() === '') {
          message = 'Вся форма обязательна для заполнения'
        }
      } else {
        if (input.value === null) {
          message = 'Вся форма обязательна для заполнения'
        } else {
          const minDOB = 1900
          const minDateIn = 2000
          const year = parseInt(input.value.toLocaleDateString().substr(-4))

          if (input.name === 'DOB' && minDOB > year || year > new Date().getFullYear()) {
            message = 'Некорректная дата рождения'
          } else if (input.name === 'dateIn' && minDateIn > year || year > parseInt(new Date().getFullYear())) {
            message = 'Некорректная дата поступления'
          }
        }
      }
    })

    if (message) formNotification(message)
  })
})
