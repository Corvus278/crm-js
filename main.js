function replaceDate(dateString) {
  const dateList = dateString.split('.');
  [dateList[0], dateList[1]] = [dateList[1], dateList[0]]
  return dateList.join('.')
}


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
    // Если localStorage ещё пустой
    oldList = []
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
        formatDate.dateOfBirthday = input.value.toLocaleDateString()
        break
      case 'dateIn':
        formatDate.dateIn = input.value.toLocaleDateString()
        break
    }
  })

  add2localStorage(formatDate)
}


function filterByAlphabet(students, key) {
  if (key === 'fio') {
    return students.sort((studentA, studentB) => {
      if ((studentA.surname + studentA.name + studentA.secondName).toLowerCase() < (studentB.surname + studentB.name + studentB.secondName).toLowerCase()) return -1
      else return 1
    })
  } else {
    return students.sort((studentA, studentB) => {
      if (studentA[key].toLowerCase() < studentB[key].toLowerCase()) return -1
      else return 1
    })
  }
}


function tableRender(students = JSON.parse(localStorage.getItem('students'))) {
  function studentCourse(dateIn) {
    const dateNow = new Date()
    const dateEnd = new Date(`01.09.${dateIn.getFullYear() + 4}`)

    if (dateNow > dateEnd) { return 'закончил' }
    else {
      return `${(parseInt(dateNow.getFullYear()) - parseInt(dateIn.getFullYear())) + 1} курс`
    }
  }

  const nowYear = new Date().getFullYear()
  const table = document.querySelector('.table-students')
  const tbody = table.querySelector('tbody')

  // Очищение таблицы
  Array.from(tbody.querySelectorAll('tr')).forEach(tr => tr.remove())

  // Рендеринг столбцов
  if (students) {
    students.forEach((student) => {
      // Преобразование времени в объект
      const fullDateOfBirthday = new Date(replaceDate(student.dateOfBirthday))
      student.dateOfBirthday = fullDateOfBirthday
      const fullDateIn = new Date(replaceDate(student.dateIn))
      student.dateIn = fullDateIn

      // Создание DOM
      const tr = document.createElement('tr')

      const th = document.createElement('th')
      th.scope = 'row'
      th.textContent = tbody.childElementCount + 1

      const fio = document.createElement('td')
      const faculty = document.createElement('td')
      const dateOfBirthday = document.createElement('td')
      const dateIn = document.createElement('td')

      // Заполнение столбцов
      fio.textContent = `${student.surname} ${student.name} ${student.secondName}`
      faculty.textContent = student.faculty
      dateOfBirthday.textContent = `${student.dateOfBirthday.toLocaleDateString()} (${parseInt(nowYear) - parseInt(student.dateOfBirthday.getFullYear())} лет)`
      dateIn.textContent = `${student.dateIn.getFullYear()}-${parseInt(student.dateIn.getFullYear()) + 3} (${studentCourse(student.dateIn)})`

      // Рендеринг
      tr.append(...[
        th,
        fio,
        faculty,
        dateOfBirthday,
        dateIn
      ])
      tbody.append(tr)
    })
  }
}


document.addEventListener('DOMContentLoaded', () => {
  // Рендер таблицы
  tableRender()
  // localStorage.clear()

  document.querySelector('.form-add').addEventListener('submit', (e) => {
    e.preventDefault()

    // Запись значений формы в объект
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
        } else if (input.name === 'FIO' && input.value.split(' ').length < 3) {
          message = 'Нужно указать полное ФИО'
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
      tableRender()
    }
  })

  // ------ Фильтры для таблицы ------

  // Обработчик на форму фильтра
  // Сброс перезагрузки
  document.querySelector('.table-filter').addEventListener('submit', (e) => {
    e.preventDefault()
  })

  Array.from(document.querySelectorAll('.table-filter__submit')).forEach((btn => {
    btn.addEventListener('click', () => {
      // Список студентов
      const students = JSON.parse(localStorage.getItem('students'))

      // Нужный инпут
      const input = document.querySelector(`input[name="` + String(btn.id) + `"]`)
      console.log(input)
      const searchValue = input.value

      const searchStudents = students.filter((student) => {
        switch (btn.id) {
          case 'FIO-filter':
            const fio = student.surname + student.name + student.secondName
            if (fio.includes(searchValue)) return true
            break
          case 'faculty-filter':
            if (student.faculty.includes(searchValue)) return true
            break
          case 'dateIn-filter':
            console.log(student.dateIn)
            if (student.dateIn.substr(-4) === searchValue) return true
            break
          case 'dateOut-filter':
            console.log('dateOut')
            console.log(searchValue)
            console.log(String(parseInt(student.dateIn.substr(-4)) + 3))
            if (String(parseInt(student.dateIn.substr(-4)) + 3) === searchValue) return true
            break
          default:
            return false
        }
      })

      // Рендеринг таблицы
      tableRender(searchStudents)
    })
  }))

  // Обработчики на заголовки таблицы
  document.querySelector('.table-th__fio').addEventListener('click', () => {
    tableRender(filterByAlphabet(JSON.parse(localStorage.getItem('students')), 'fio'))
  })
  document.querySelector('.table-th__faculty').addEventListener('click', () => {
    tableRender(filterByAlphabet(JSON.parse(localStorage.getItem('students')), 'faculty'))
  })
  document.querySelector('.table-th__DOB').addEventListener('click', () => {
    const students = JSON.parse(localStorage.getItem('students'))
    students.sort((studentA, studentB) => {
      if (new Date(replaceDate(studentA.dateOfBirthday)) < new Date(replaceDate(studentB.dateOfBirthday))) return -1
      else return 1
    })
    tableRender(students)
  })
  document.querySelector('.table-th__years-of-studing').addEventListener('click', () => {
    const students = JSON.parse(localStorage.getItem('students'))
      .sort((studentA, studentB) => {
        if (parseInt(studentA.dateIn.substr(-4)) < parseInt(studentB.dateIn.substr(-4))) return -1
        else return 1
      })
    tableRender(students)
  })
})
