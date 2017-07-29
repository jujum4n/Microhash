        jQuery(document).ready(function($, undefined) {
          // Use a "/test" namespace.
          // An application can open a connection on multiple namespaces, and
          // Socket.IO will multiplex all those connections on a single
          // physical channel. If you don't care about multiple channels, you
          // can set the namespace to an empty string.
          namespace = '/test';
          // Connect to the Socket.IO server.
          // The connection URL has the following format:
          //     http[s]://<domain>:<port>[/<namespace>]
          var socket = io.connect('http://' + document.domain + ':' + location.port + namespace);
          // Event handler for new connections.
          // The callback function is invoked when a connection with the
          // server is established.
          socket.on('connect', function() {
            socket.emit('my event', {
              data: 'Connected!\n'
            });
          });
          // Event handler for server sent data.
          // The callback function is invoked whenever the server emits data
          // to the client. The data is then displayed in the "Received"
          // section of the page.
          socket.on('my response', function(msg) {
            //$('#log').append('<br>' + $('<div/>').text('Received #' + msg.count + ': ' + msg.data).html());
            terminal.echo(msg.data);
          });

          // Interval function that tests message latency by sending a "ping"
          // message. The server then responds with a "pong" message and the
          // round trip time is measured.
          var ping_pong_times = [];
          var start_time;
          window.setInterval(function() {
            start_time = (new Date).getTime();
            socket.emit('my ping');
          }, 1000);
          // Handler for the "pong" message. When the pong is received, the
          // time from the ping is stored, and the average of the last 30
          // samples is average and displayed.
          socket.on('my pong', function() {
            var latency = (new Date).getTime() - start_time;
            ping_pong_times.push(latency);
            ping_pong_times = ping_pong_times.slice(-30); // keep last 30 samples
            var sum = 0;
            for (var i = 0; i < ping_pong_times.length; i++)
              sum += ping_pong_times[i];
            $('#ping-pong').text(Math.round(10 * sum / ping_pong_times.length) / 10);
          });
          // Handlers for the different forms in the page.
          // These accept data from the user and send it to the server in a
          // variety of ways
          $('form#emit').submit(function(event) {
            socket.emit('my event', {
              data: $('#emit_data').val()
            });
            return false;
          });
          $('form#broadcast').submit(function(event) {
            socket.emit('my broadcast event', {
              data: $('#broadcast_data').val()
            });
            return false;
          });
          $('form#join').submit(function(event) {
            socket.emit('join', {
              room: $('#join_room').val()
            });
            return false;
          });
          $('form#leave').submit(function(event) {
            socket.emit('leave', {
              room: $('#leave_room').val()
            });
            return false;
          });
          $('form#send_room').submit(function(event) {
            socket.emit('my room event', {
              room: $('#room_name').val(),
              data: $('#room_data').val()
              });
            return false;
          });
          $('form#close').submit(function(event) {
            socket.emit('close room', {
              room: $('#close_room').val()
            });
            return false;
          });
          $('form#disconnect').submit(function(event) {
            socket.emit('disconnect request');
            return false;
          });
          var greet_text = 'Microhash Computer Systems v0.1\n-------------------------------';

          var terminal = $('#wsscreen').terminal(function(command, term) {
            if (command !== '') {
              var split_command = $.terminal.parse_command(command);

              if (split_command['name'] === 'users') {
                socket.emit('list users');
              }
              else if (split_command['name'] === 'help') {
                socket.emit('help me');
              }
              else {
                term.error('Unknown Command: ' + command);
              }
            }
          }, {
            greetings: greet_text,
            name: 'wsterm',
            height: window.height,
            prompt: '>> '
          });
        });

        // Hide the scroll bar in the terminal
        $(function(c) {
          var a = ["DOMMouseScroll", "mousewheel"];
          c.event.special.mousewheel = {
            setup: function() {
              if (this.addEventListener) {
                for (var d = a.length; d;) {
                  this.addEventListener(a[--d], b, false)
                }
              }
              else {
                this.onmousewheel = b
              }
            },
            teardown: function() {
              if (this.removeEventListener) {
                for (var d = a.length; d;) {
                  this.removeEventListener(a[--d], b, false)
                }
              }
              else {
                this.onmousewheel = null
              }
            }
          };
          c.fn.extend({
            mousewheel: function(d) {
              return d ? this.bind("mousewheel", d) : this.trigger("mousewheel")
            },
            unmousewheel: function(d) {
              return this.unbind("mousewheel", d)
            }
          });

          function b(f) {
            var d = [].slice.call(arguments, 1),
              g = 0,
              e = true;
            f = c.event.fix(f || window.event);
            f.type = "mousewheel";
            if (f.wheelDelta) {
              g = f.wheelDelta / 120
            }
            if (f.detail) {
              g = -f.detail / 3
            }
            d.unshift(f, g);
            return c.event.handle.apply(this, d)
          }
        })(jQuery);

        /*
        The following not-working code is from:
        http://stackoverflow.com/questions/1326570/how-to-disable-browser-or-element-scrollbar-but-let-scrolling-with-wheel-or-arro*/
        $("div").bind("mousewheel", function(ev, delta) {
          var scrollTop = $(this).scrollTop();
          $(this).scrollTop(scrollTop - Math.round(delta * 20));
        });