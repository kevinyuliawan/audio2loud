window.AudioContext = window.AudioContext || window.webkitAudioContext;
var context = new AudioContext();
var ctx = $("#canvas").get()[0].getContext("2d");
var WIDTH = 100;
var HEIGHT = 50;
var active = false;


 var gradient = ctx.createLinearGradient(0,0,0,130);
    gradient.addColorStop(1,'#000000');
    gradient.addColorStop(0.75,'#ff0000');
    gradient.addColorStop(0.25,'#ffff00');
    gradient.addColorStop(0,'#ffffff');


var audio0 = new Audio();
//audio0.src="/Users/KevinY/Music/Hiatus Kaiyote -Nakamarra.mp3";
audio0.src="/Users/KevinY/Music/We Came As Romans - To Plant A Seed.mp3";

var source = context.createMediaElementSource(audio0);
var compressor = context.createDynamicsCompressor();
compressor.threshold.value = -40;
compressor.knee.value = 40;
compressor.ratio.value = 1000;
compressor.reduction.value = -20;
compressor.attack.value = 0;
compressor.release.value = 1;

var destination = context.destination;

console.log(compressor);

//source.connect(compressor);
//compressor.connect(dest);

/*With this variable we use input from a longer time period to calculate the amplitudes, this results in a more smooth meter. The fftSize determine how many buckets we get containing frequency information. If we have a fftSize of 1024 we get 512 buckets (more info on this in the book on DPS and fourier transformations).*/
var analyser = context.createAnalyser();
analyser.smoothingTimeConstant = 0.3;
analyser.fftSize = 1024;
analyser.maxDecibels = 0;
console.log(analyser);


/*This will create a ScriptProcessor that is called whenever the 2048 frames have been sampled. Since our data is sampled at 44.1k, this function will be called approximately 21 times a second */
var javascriptNode = context.createScriptProcessor(2048, 1, 1);


// when the javascript node is called
// we use information from the analyzer node
// to draw the volume

var count = 0;
javascriptNode.onaudioprocess = function() {

    // get the average, bincount is fftsize / 2
    var array =  new Uint8Array(analyser.frequencyBinCount);
    analyser.getByteFrequencyData(array);
    var average = getAverageVolume(array)

    // clear the current state
    ctx.clearRect(0, 0, WIDTH, HEIGHT/2);

    // set the fill style
    ctx.fillStyle="green";

    // create the meters
    ctx.fillRect(0,0,(average*WIDTH)/analyser.frequencyBinCount*2.5,HEIGHT); //make up for the fact that it's the average
    if(average > count) {$('#count').html(average);count=average;}
}

function getAverageVolume(array) {
    var values = 0;
    var average;

    var length = array.length;

    // get all the frequency amplitudes
    for (var i = 0; i < length; i++) {
        values += array[i];
    }

    average = values / length;
    return average;
}

/* set up drawing nodes */
javascriptNode.connect(context.destination);
source.connect(compressor);
compressor.connect(analyser);
analyser.connect(javascriptNode);
compressor.connect(context.destination);

function connect(){
  source.disconnect(analyser);
  source.disconnect(context.destination);

  source.connect(compressor);
  compressor.connect(analyser);
  compressor.connect(context.destination);

  analyser.connect(javascriptNode);
  javascriptNode.connect(context.destination)
  console.log('on');
};

function disconnectAll(){
  compressor.disconnect(analyser);
  source.disconnect(compressor);
  compressor.disconnect(context.destination);

  source.connect(analyser);
  analyser.connect(javascriptNode);
  source.connect(context.destination);

  analyser.connect(javascriptNode);
  javascriptNode.connect(context.destination)
  console.log('off');
};



var playSound = function() {
  audio0.play();
  console.log('playing');
};

var toggleSound = function(){
    if(gainNode.channelCount == 2){
        gainNode.channelCount = 1
    }else gainNode.channelCount = 2;
}


var playBtn = document.getElementById('play');
var stopBtn = document.getElementById('stop');
var toggleBtn = document.getElementById('toggle');

playBtn.addEventListener('click', playSound, false);
stopBtn.addEventListener('click', function(){audio0.pause()}, false);
toggleBtn.addEventListener('click', toggleSound, false);

$('#on').click(function(){ connect(); })
$('#off').click(function(){ disconnectAll(); })