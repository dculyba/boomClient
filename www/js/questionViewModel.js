/**
 * Created by sabrina on 7/27/2015.
 */
function Question() {
    this.time_asked = ko.observable(data.time_asked);
    this.text = ko.observable(data.text);
    this.yes_count = ko.observable(data.yes_count);
    this.no_count = ko.observable(data.no_count);
    this.asker_id = ko.observable(data.asker_id);
    this.id = ko.observable(data.id);
}

var signedInToGoogleAndBoom = false;
function QuestionViewModel()
{
    var self = this;
    self.questions = ko.observableArray();
    self.currentContext = ko.observable("QuestionsList");
    self.selectedQuestionText = ko.observable("");

    function init() {
        var apisToLoad;
        var loadCallback = function() {
            if (--apisToLoad == 0) {
                enableButtons();
                signin(true, userAuthed);
                self.loadAllQuestions();
            }
        };

        apisToLoad = 2; // must match number of calls to gapi.client.load()
        apiRoot = 'https://boom-it.appspot.com/_ah/api/boom';
        gapi.client.load('boom-it', 'v1', loadCallback, apiRoot);
        gapi.client.load('oauth2', 'v2', loadCallback);
    }

    var signin = function signin(mode, authorizeCallback) {
        gapi.auth.authorize({client_id: '638374801515-n10hc1195mq8jt42qu881uvdhbt9ogue.apps.googleusercontent.com',
                scope: 'https://www.googleapis.com/auth/userinfo.email', immediate: mode},
            authorizeCallback);
    }

    /**
     * Presents the user with the authorization popup.
     */
    var auth = function() {
        if (!signedInToGoogleAndBoom) {
            signin(false,userAuthed);
        } else {
            signedInToGoogleAndBoom = false;
            document.querySelector('#signinButton').textContent = 'Sign in';
            document.querySelector('#authedGreeting').disabled = true;
        }
    };

    var enableButtons = function() {
        var signinButton = document.querySelector('#signinButton');
        signinButton.addEventListener('click', auth);
    }

    var userAuthed = function userAuthed() {
        var request =
            gapi.client.oauth2.userinfo.get().execute(function(resp) {
                if (!resp.code) {
                    // User is signed in, call my Endpoint
                    signedInToGoogleAndBoom = true;
                    document.querySelector('#signinButton').textContent = 'Sign out';
                    document.querySelector('#authedGreeting').disabled = false;
                }
            });
    }




    self.loadData = function() {
        $.getJSON("https://boom-it.appspot.com/_ah/api/boom/v1/questions", function (allData) {
            var mappedQuestions = $.map(allData, function (item) {
                return new Question(item)
            });
            self.questions(mappedQuestions);
        });
    }

    self.loadAllQuestions = function() {
        self.questions.removeAll();
        self.loadData();

        for (var i = 0; i<questions.length; i++)
        {
            var question = new Question(
                questions[i].questionText
            );
            self.questions.push(question);
        }
    };

    self.viewAllQuestions = function() {
        self.currentContext("QuestionsList");
    };

    self.answerQuestion = function() {
        self.currentContext("AnswerQuestion");
        self.currentQuestion = this;
        self.selectedQuestionText(this.questionText);
    };

    self.newQuestion = function() {
        self.currentContext("NewQuestion");
    };

    init();
}; //QuestionViewModel

