var TxtType = function (el, toRotate, period) {
  this.toRotate = toRotate;
  this.el = el;
  this.loopNum = 0;
  this.period = parseInt(period, 10) || 2000;
  this.txt = '';
  this.tick();
  this.isDeleting = false;
};

TxtType.prototype.tick = function () {
  var i = this.loopNum % this.toRotate.length;
  var fullTxt = this.toRotate[i];

  if (this.isDeleting) {
    this.txt = fullTxt.substring(0, this.txt.length - 1);
  } else {
    this.txt = fullTxt.substring(0, this.txt.length + 1);
  }

  this.el.innerHTML = '<span class="wrap">' + this.txt + '</span>';

  var that = this;
  var delta = 200 - Math.random() * 100;

  if (this.isDeleting) { delta /= 2; }

  if (!this.isDeleting && this.txt === fullTxt) {
    delta = this.period;
    this.isDeleting = true;
  } else if (this.isDeleting && this.txt === '') {
    this.isDeleting = false;
    this.loopNum++;
    delta = 500;
  }

  setTimeout(function () {
    that.tick();
  }, delta);
};

window.onload = function () {
  var elements = document.getElementsByClassName('typewrite');
  for (var i = 0; i < elements.length; i++) {
    var toRotate = elements[i].getAttribute('data-type');
    var period = elements[i].getAttribute('data-period');
    if (toRotate) {
      new TxtType(elements[i], JSON.parse(toRotate), period);
    }
  }
  // INJECT CSS
  var css = document.createElement("style");
  css.innerHTML = ".typewrite > .wrap { border-right: 0.08em solid #cff9d9}";
  document.body.appendChild(css);
};




google.charts.load('current', { packages: ['corechart', 'bar'] });
google.charts.setOnLoadCallback(drawBasic);

function drawBasic() {

  var options = {
    title: 'Hands-on & experience with various skill sets, year wise timeline',
    chartArea: { width: '70%' },
    width: 800,
    height: 400,
    vAxis: {
      title: 'Years',
      minValue: 0
    },
    legend: { position: 'bottom', maxLines: 3 },
    isStacked: true
  };

  var data = google.visualization.arrayToDataTable([
    ['Genre', 'Data Structures/Algorithm', 'Javascript/TypeScript', 'Java', 'C/C++', 'Python3', 'Angular', 'Node.js',
      'MongoDB', 'Flutter/Dart', 'Native Android Development', 'Git', 'SQL', { role: 'annotation' }],
    ['2017', 25, 5, 20, 10, 10, 0, 0, 0, 0, 20, 5, 5, ''],
    ['2018', 20, 5, 20, 5, 5, 10, 0, 0, 0, 25, 5, 5, ''],
    ['2019', 10, 15, 10, 0, 0, 15, 10, 10, 5, 5, 10, 10, ''],
    ['2020', 10, 20, 5, 0, 0, 20, 15, 10, 10, 0, 10, 0, '']
  ]);


  var chart = new google.visualization.BarChart(document.getElementById('chart_div'));

  chart.draw(data, options);
}


var container = document.getElementById("retainable-rss-embed");
if (container) {
    var css = document.createElement('link');
    css.href = "https://www.twilik.com/assets/retainable/rss-embed/retainable.css";
    css.rel = "stylesheet"
    document.getElementsByTagName('head')[0].appendChild(css);
    var script = document.createElement('script');
    script.src = "https://www.twilik.com/assets/retainable/rss-embed/retainable.js";
    document.getElementsByTagName('body')[0].appendChild(script);
}
