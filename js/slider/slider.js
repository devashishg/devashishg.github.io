$(document).scroll(function() {
  var dHeight = $("#nav1").height();
  var alpha = (($(this).scrollTop() / dHeight ) / 10);
  $('#changeBg').css('background', 'rgba(58,118,70,' +(alpha * 12)  + ')');
});
