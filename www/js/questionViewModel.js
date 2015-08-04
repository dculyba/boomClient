//** Questions Class **//
function Question(data) {
    this.time_asked = ko.observable(data.time_asked);
    this.text = ko.observable(data.text);
    this.yes_count = ko.observable(data.yes_count);
    this.no_count = ko.observable(data.no_count);
    this.asker_id = ko.observable(data.asker_id);
    this.id = ko.observable(data.id);
};

CLIENT_ID = '638374801515-n10hc1195mq8jt42qu881uvdhbt9ogue.apps.googleusercontent.com';
SCOPES = 'https://www.googleapis.com/auth/userinfo.email';
API_ROOT = 'https://boom-it.appspot.com/_ah/api/';

function QuestionViewModel()
{
    var self = this;
    self.authenticated = false;
    self.questions = ko.observableArray();
    self.currentContext = ko.observable("QuestionsList");
    self.selectedQuestionText = ko.observable("");
    self.newQuestionToAsk = ko.observable("");

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
        gapi.client.load('boom', 'v1', loadCallback, API_ROOT);
        gapi.client.load('oauth2', 'v2', loadCallback);
    }

    var signin = function signin(mode, authorizeCallback) {
        gapi.auth.authorize({client_id: CLIENT_ID, scope: SCOPES, immediate: mode}, authorizeCallback);
    };


    var signout = function signout() {
        gapi.auth2.init({client_id: CLIENT_ID});
        var auth2 = gapi.auth2.getAuthInstance();
        auth2.signOut().then(function () {
            console.log('User signed out.');
        });
    }
    /**
     * Presents the user with the authorization popup.
     */
    var auth = function() {
        if (!self.authenticated) {
            signin(false,userAuthed);
        }
        else
        {
            self.authenticated = false;
            document.querySelector('#signinButton').textContent = 'Sign in';
        }
    };

    var enableButtons = function() {
        var signinButton = document.querySelector('#signinButton');
        signinButton.addEventListener('click', auth);
    };

    var userAuthed = function userAuthed() {
        var request =
            gapi.client.oauth2.userinfo.get().execute(function(resp) {
                if (!resp.code) {
                    // User is signed in, call my Endpoint
                    self.authenticated = true;
                    document.querySelector('#signinButton').textContent = 'Sign out';
                    signinButton.addEventListener('click', signout);
                }
            });
    };

    self.processQuestionDataInJSON = function(questionDataInJSON) {
        console.error(questionDataInJSON.questions);
        for (var i = 0; i<questionDataInJSON.questions.length; i++) {
            self.questions.push(new Question(questionDataInJSON.questions[i]));
        }
        console.error("self.questions: " + self.questions.toString());
    };



    self.loadData = function() {
        gapi.client.boom.questions.listQuestions().execute(self.processQuestionDataInJSON);
    };

    self.submitQuestion = function()
    {
        var questionObject = gapi.client.boom.questions.insertQuestion({'question_text':
            self.newQuestionToAsk()}).execute(self.loadAllQuestions);
        self.viewAllQuestions();
    };

// Behaviours
    self.goToContext = function(contextRequest) { self.currentContext(contextRequest); };

    self.loadAllQuestions = function() {
        self.questions.removeAll();
        self.loadData();
    };

    self.viewAllQuestions = function() {
        self.currentContext("QuestionsList");
    };

    self.answerQuestion = function() {
        self.currentContext("AnswerQuestion");
        self.currentQuestion = this;
        self.selectedQuestionText(this.text);
    };

    self.newQuestion = function() {
        self.currentContext("NewQuestion");
    };

    init();
}; //QuestionViewModel

