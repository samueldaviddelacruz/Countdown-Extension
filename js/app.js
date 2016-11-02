/**
 * Created by Samuel on 11/1/2016.
 */
var app = angular.module('counterApp', []);


var counterController = function($interval,$scope){
    var counter = this;
    var timeinterval;

    counter.warningThreshold = 1800000;

    function init(){
        var queryInfo = {
            active: true,
            currentWindow: true
        };
        chrome.tabs.query(queryInfo,function(tabs){


            setMinDateTomorrow();

            getSavedGoal(function(goal){

                counter.goalTitle = goal.title;

                if(goal.goalMilis === 0){
                    counter.goalDate = undefined;
                    $scope.$apply();
                    return;
                }
                    counter.goalDate = new Date(goal.goalMilis);
                    initializeClock(counter.goalDate);
            })

        });
    }

    function getTimeRemaining(endtime) {
        var t = Date.parse(endtime) - Date.parse(new Date());

        var seconds = Math.floor((t / 1000) % 60);
        var minutes = Math.floor((t / 1000 / 60) % 60);
        var hours = Math.floor((t / (1000 * 60 * 60)) % 24);

        var days = Math.floor(t / (1000 * 60 * 60 * 24));

        return {
            'total': t,
            'days': days,
            'hours': hours,
            'minutes': minutes,
            'seconds': seconds
        };
    }

    function getSavedGoal(callback){

        chrome.storage.sync.get({title:'No Goal Set!',goalMilis:0}, callback);

    }
    function saveGoal(title,date,callback){

        chrome.storage.sync.set({title:title,goalMilis:date.getTime()},callback);
    }


    function stopCounter(){
        if (angular.isDefined(timeinterval)) {
            $interval.cancel(timeinterval);
            timeinterval = undefined;
           //counter.goalDate = undefined;
        };
    }
    function checkWarningThreshHold(t){
        if(t.total <= counter.warningThreshold){
            counter.timeWarning = "Time is running out!";
            return;
        }
        counter.timeWarning = "";
    }
    function initializeClock(endtime) {
        //clear interval if exists, in case a new goal date is selected
        stopCounter();

        function updateClock() {
            var t = getTimeRemaining(endtime);
            if (t.total <= 0) {
                stopCounter();
                return;
            }
            checkWarningThreshHold(t);
            updateCounter(t);

        };

        updateClock();
        timeinterval = $interval(updateClock, 1000);
    }
    function updateCounter(t) {
        counter.daysSpan = t.days;
        counter.hoursSpan = ('0' + t.hours).slice(-2);
        counter.minutesSpan = ('0' + t.minutes).slice(-2);
        counter.secondsSpan = ('0' + t.seconds).slice(-2);
    };


    function getTomorrowDate(){
        var tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        return tomorrow;
    }
    function setMinDateTomorrow(){
        var tomorrow = getTomorrowDate();
        counter.tomorrowDate = tomorrow;
    }

    counter.setGoalTime = () => {

        if(!isGoalSet()){
            counter.goalnotSetMessage = "Please Set a title and a date for your goal!";
            return;
        }
            counter.goalnotSetMessage = "";
            saveGoal(counter.goalText,counter.goalDate,function(){
                console.log('Success');
                counter.goalTitle = counter.goalText;
                initializeClock(counter.goalDate);

            });
    };

    function isGoalSet(){
        return counter.goalText && counter.goalDate;
    }

    init();

};;

app.controller('counterController',counterController);
