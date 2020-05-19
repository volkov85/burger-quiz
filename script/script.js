document.addEventListener('DOMContentLoaded', () => {
    'use strict';

    const btnOpenModal = document.querySelector('#btnOpenModal');
    const modalBlock = document.querySelector('#modalBlock');
    const closeModal = document.querySelector('#closeModal');
    const questionTitle = document.querySelector('#question');
    const formAnswers = document.querySelector('#formAnswers');
    const burgerBtn = document.getElementById('burger');
    const nextButton = document.getElementById('next');
    const prevButton = document.getElementById('prev');
    const modalDialog = document.querySelector('.modal-dialog');
    const sendButton = document.getElementById('send');
    const modalTitle = document.querySelector('.modal-title');

    // Your web app's Firebase configuration
    const firebaseConfig = {
        apiKey: "AIzaSyDT-dQncJ4Kve06KuESrYROi3sad-MvBWQ",
        authDomain: "birger-quiz.firebaseapp.com",
        databaseURL: "https://birger-quiz.firebaseio.com",
        projectId: "birger-quiz",
        storageBucket: "birger-quiz.appspot.com",
        messagingSenderId: "1058765395047",
        appId: "1:1058765395047:web:47a923b67b5de25c43f0c2",
        measurementId: "G-QJ8CRHLJ6Z"
    };
    // Initialize Firebase
    firebase.initializeApp(firebaseConfig);

    //Функция получения данных
    const getData = () => {
        formAnswers.innerHTML = `<img src="../image/spinner.svg"/>`;

        nextButton.classList.add('d-none');
        prevButton.classList.add('d-none');

        firebase.database().ref().child('questions').once('value')
            .then(snap => playTest(snap.val()))
    };

    let count = -100;

    modalDialog.style.top = count + '%';

    const animateModal = () => {
        modalDialog.style.top = count + '%';
        count += 3;

        if (count < 0) {
            requestAnimationFrame(animateModal);
        } else {
            count = -100;
        }
    };

    let clientWidth = document.documentElement.clientWidth;

    if (clientWidth < 768) {
        burgerBtn.style.display = 'flex';
    } else {
        burgerBtn.style.display = 'none';
    }

    //Скрытие значка бургер меню при увеличении разрешения окна
    window.addEventListener('resize', () => {
        clientWidth = document.documentElement.clientWidth;

        if (clientWidth < 768) {
            burgerBtn.style.display = 'flex';
        } else {
            burgerBtn.style.display = 'none';
        }
    });

    //Обработчики событий открытия/закртытия модального окна
    burgerBtn.addEventListener('click', () => {
        burgerBtn.classList.add('active');
        requestAnimationFrame(animateModal);
        modalBlock.classList.add('d-block');
        playTest();
    });

    btnOpenModal.addEventListener('click', () => {
        requestAnimationFrame(animateModal);
        modalBlock.classList.add('d-block');
        getData();
    });

    closeModal.addEventListener('click', () => {
        modalBlock.classList.remove('d-block');
        burgerBtn.classList.remove('active');
    });

    //Закрытие модального окна при клике на область вне этого окна
    document.addEventListener('click', (event) => {
        if (
            !event.target.closest('.modal-dialog') &&
            !event.target.closest('.openModalButton') &&
            !event.target.closest('.burger')
        ) {
            modalBlock.classList.remove('d-block');
            burgerBtn.classList.remove('active');
        }
    })

    //Функция вывода вопросов для теста
    const playTest = (questions) => {
        const finalAnswers = [];
        const obj = {};

        let numberQuestion = 0;
        modalTitle.textContent = 'Ответь на вопрос';

        //Функция рендеринга ответов
        const renderAnswers = (index) => {
            questions[index].answers.forEach((answer) => {
                const answerItem = document.createElement('div');
                answerItem.classList.add('answers-item', 'd-flex', 'justify-content-center');
                answerItem.innerHTML = `
                    <input type="${questions[index].type}" id="${answer.title}" name="answer" class="d-none" value=''>
                    <label for="${answer.title}" class="d-flex flex-column justify-content-between">
                        <img class="answerImg" src="${answer.url}" alt="burger">
                        <span>${answer.title}</span>
                    </label>
                `;
                formAnswers.appendChild(answerItem);
            })
        }

        //Функция рендеринга вопросов + ответов
        const renderQuestions = (indexQuestion) => {
            formAnswers.innerHTML = '';

            //Проверка на первый и последний вопрос для скрытия кнопок prev и next
            switch (true) {
                case (numberQuestion >= 0 && numberQuestion <= questions.length - 1):
                    questionTitle.textContent = `${questions[indexQuestion].question}`;
                    renderAnswers(indexQuestion);
                    nextButton.classList.remove('d-none');
                    prevButton.classList.remove('d-none');
                    sendButton.classList.add('d-none');
                    if (numberQuestion === 0) {
                        prevButton.classList.add('d-none');
                    }
                    break;

                case (numberQuestion === questions.length):
                    questionTitle.textContent = '';
                    modalTitle.textContent = '';
                    nextButton.classList.add('d-none');
                    prevButton.classList.add('d-none');
                    sendButton.classList.remove('d-none');
                    formAnswers.innerHTML = `
                    <div class="form-group">
                        <label for="numberPhone">Введите номер телефона</label>
                        <input type="phone" class="form-control" id="numberPhone">
                    </div>
                    `;
                    const numberPhone = document.querySelector('#numberPhone');
                    numberPhone.addEventListener('input', (event) => {
                        event.target.value = event.target.value.replace(/[^0-9+-]/, '');
                    });
                    break;

                case (numberQuestion === questions.length + 1):
                    formAnswers.textContent = 'Спасибо за пройденный тест!';
                    for (let key in obj) {
                        let newObj = {};
                        newObj[key] = obj[key];
                        finalAnswers.push(newObj);
                    }
                    sendButton.classList.add('d-none');
                    setTimeout(() => {
                        modalBlock.classList.remove('d-block');
                        burgerBtn.classList.remove('active');
                    }, 2000);
                    break;
            }
        }

        //Запуск функции рендеринга
        renderQuestions(numberQuestion);

        const checkAnswer = () => {
            const inputs = [...formAnswers.elements].filter((input) => input.checked || input.id === 'numberPhone');

            inputs.forEach((input, index) => {
                if (numberQuestion >= 0 && numberQuestion <= questions.length - 1) {
                    obj[`${index}_${questions[numberQuestion].question}`] = input.value;
                }

                if (numberQuestion === questions.length) {
                    obj['Номер телефона'] = input.value;
                }
            })
        }

        //Обработчик событий кнопок prev и next
        nextButton.onclick = () => {
            checkAnswer();
            numberQuestion++;
            renderQuestions(numberQuestion);
        }
        prevButton.onclick = () => {
            numberQuestion--;
            renderQuestions(numberQuestion);
        }

        sendButton.onclick = () => {
            checkAnswer();
            numberQuestion++;
            renderQuestions(numberQuestion);
            firebase
                .database()
                .ref()
                .child('contacts')
                .push(finalAnswers)
        }
    }
});