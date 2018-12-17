var TxtType = function(el, toRotate, period) {
        this.toRotate = toRotate;
        this.el = el;
        this.loopNum = 0;
        this.period = parseInt(period, 10) || 2000;
        this.txt = '';
        this.tick();
        this.isDeleting = false;
    };

    TxtType.prototype.tick = function() {
        var i = this.loopNum % this.toRotate.length;
        var fullTxt = this.toRotate[i];

        if (this.isDeleting) {
        this.txt = fullTxt.substring(0, this.txt.length - 1);
        } else {
        this.txt = fullTxt.substring(0, this.txt.length + 1);
        }

        this.el.innerHTML = '<span class="wrap">'+this.txt+'</span>';

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

        setTimeout(function() {
        that.tick();
        }, delta);
    };

    window.onload = function() {
        var elements = document.getElementsByClassName('typewrite');
        for (var i=0; i<elements.length; i++) {
            var toRotate = elements[i].getAttribute('data-type');
            var period = elements[i].getAttribute('data-period');
            if (toRotate) {
              new TxtType(elements[i], JSON.parse(toRotate), period);
            }
        }
        // INJECT CSS
        var css = document.createElement("style");
        css.type = "text/css";
        css.innerHTML = ".typewrite > .wrap { border-right: 0.08em solid #cff9d9}";
        document.body.appendChild(css);
    };





// Google Charts
    //
    // google.charts.load("current", {packages:["corechart"]});
    // google.charts.setOnLoadCallback(drawChart);
    // function drawChart() {
    //   var data = google.visualization.arrayToDataTable([
    //     ['Language', 'Speakers (in %)'],
    //     ['Java', 70], ['Python', 35], ['Android_Development', 60],
    //     ['C', 25], ['C++', 30], ['SQL', 50],['DS & Algorithm',60],['Git',60],['PHP',25],['Angular',35]
    //   ]);
    //
    //   var options = {
    //     title: 'Skill ',
    //     legend: 'none',
    //     pieSliceText: 'label',
    //     slices: {  4: {offset: 0.2},
    //               12: {offset: 0.3},
    //               14: {offset: 0.4},
    //               15: {offset: 0.5},
    //     },
    //   };
    //
    //   var chart = new google.visualization.PieChart(document.getElementById('piechart'));
    //   chart.draw(data, options);
    // }




    google.charts.load('current', {packages: ['corechart', 'bar']});
google.charts.setOnLoadCallback(drawBasic);

function drawBasic() {

      var data = google.visualization.arrayToDataTable([
        ['Skill', 'Rating',],
        ['Java', 70],
        ['javascript/TypeScript', 25],
        ['C/C++', 35],
        ['Python3', 60],
        ['Angular6', 20],
        ['Php', 25],
        ['SQL', 50],
        ['Android_Development', 60],
        ['Data Structures/Algorithm', 55]
      ]);

      var options = {
        title: 'Skill Set',
        chartArea: {width: '50%',length:'auto'},
        vAxis: {
          title: 'Rating',
          minValue: 0
        },
        hAxis: {
          title: 'Skill Set',

        }
      };

      var chart = new google.visualization.BarChart(document.getElementById('chart_div'));

      chart.draw(data, options);
    }
