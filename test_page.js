
(function() {

    
  // based on http://stackoverflow.com/questions/4810841/json-pretty-print-using-javascript
  if (typeof WissKI === 'undefined') WissKI = {};
  if (typeof WissKI.textanly === 'undefined') WissKI.textanly = {};

  WissKI.textanly.logReload = false;
  WissKI.textanly.lastTicket = '';

  WissKI.textanly.syntaxhilite = function(json) {
    json = Drupal.parseJson(json);
    json = JSON.stringify(json, undefined, 2);
    json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    return json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, function (match) {
      var cls = 'number';
      if (/^"/.test(match)) {
        if (/:$/.test(match)) {
          cls = 'key';
        } else {
          cls = 'string';
        }
      } else if (/true|false/.test(match)) {
        cls = 'boolean';
      } else if (/null/.test(match)) {
        cls = 'null';
      }
      return '<span class="' + cls + '">' + match + '</span>';
    });
  };

  WissKI.textanly.getLogs = function(ticket) {
    
    $.ajax({
      url: Drupal.settings.basePath + 'wisski/textanly/log',
      content_type : "application/json",
      type : "POST",
      data : 'log={"ticket":"' + ticket + '","levels":["info","dbg","err","warn"]}',
      success : function (response) {
        var html = WissKI.textanly.syntaxhilite(response);
        $('#analyse_log').html(html);
        if (WissKI.textanly.logReload) window.setTimeout(function() {WissKI.textanly.getLogs(ticket)}, 500);
      }
    });

  }

  $('#analyse_do').click(function() {

    var text = $('#edit-text')[0].value;
    var profile = $('#analyse_profile')[0];
    profile = profile.options[profile.value].textContent;
    var ticket = 'test_page_ticket_' + Math.floor((Math.random() * 10000));
    analyse_interval = null;

    $('#analyse_log').html('');
    $('#analyse_result').html('Processing...');
    // escape text

    WissKI.textanly.log_reload = true;

    $.ajax({
      url: Drupal.settings.basePath + 'wisski/textanly/analyse',
      content_type : "application/json",
      type : "POST",
      data : 'text_struct=' + JSON.stringify({"ticket": ticket, "text": text, "profile": profile}),
      success : function (response) {
        var html = WissKI.textanly.syntaxhilite(response);
        
        var json = Drupal.parseJson(response);
        if (json.hasOwnProperty('annos')) {
          var annos = json.annos;
          var t = text;

          annos.sort(function(a, b) { return b.range[0] - a.range[0]; });
          for (i in annos) {
            var a = annos[i];
            t = t.substring(0, a.range[0]) + '<span style="border:double green 1px;" title="' + a.class + ': ' + a.range.join(', ') + '">' + t.substring(a.range[0], a.range[1]) + '</span>' + t.substring(a.range[1]);
          }

          html = t + '<hr/>' + html;
        }

        $('#analyse_result').html(html);
        WissKI.textanly.logReload = false;
      },
      error : function() {
        $('#analyse_result').html('An error occured');
        WissKI.textanly.logReload = false;
      }
    });
    
    WissKI.textanly.getLogs(ticket);

    return false;

  });
  
})();

