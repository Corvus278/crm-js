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


function add2localStorage(data) {
  let oldList = []

  try {
    // Получение уже имеющихся данных
    oldList = JSON.parse(localStorage.getItem('students'))
    // Добавление новых данных
    oldList.push(data)
    localStorage.setItem('students', JSON.stringify(oldList))
  } catch {
    // Если lokalStorage ещё пустой
    oldList.push(data)
    localStorage.setItem('students', JSON.stringify(oldList))
  }
}


function sendFormData(formData) {
  const formatDate = {}
  formData.forEach(input => {
    switch (input.name) {
      case 'FIO':
        const fio = input.value.split(' ')
        formatDate.surname = fio[0]
        formatDate.name = fio[1]
        formatDate.secondName = fio[2]
        break
      case 'faculty':
        formatDate.faculty = input.value
        break
      case 'DOB':
        formatDate.dateOfBirthday = input.value
        break
      case 'dateIn':
        formatDate.dateIn = input.value
        break
    }
  })

  add2localStorage(formatDate)
}


document.addEventListener('DOMContentLoaded', () => {
  document.querySelector('.form-add').addEventListener('submit', (e) => {
    e.preventDefault()

    const inputsValues = []
    const allInputs = Array.from(document.querySelector('.form-add').querySelectorAll('input'))
    allInputs.forEach((input) => {
      input.type === 'date' ? inputsValues.push({ name: input.name, value: input.valueAsDate }) : inputsValues.push({ name: input.name, value: input.value })
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
    if (message) {
      formNotification(message)
    }

    // Отправка формы в случае успешной валидации
    else {
      sendFormData(inputsValues)
      allInputs.forEach(input => input.value = '')
    }
  })
})
