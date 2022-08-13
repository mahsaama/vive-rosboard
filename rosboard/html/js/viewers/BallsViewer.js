"use strict";

// GenericViewer just displays message fields and values in a table.
// It can be used on any ROS type.

const ballCount = 16;

class BallsViewer extends Viewer {
    /**
      * Gets called when Viewer is first initialized.
      * @override
    **/

    onCreate() {
        this.viewerNode = $('<div></div>')
            .attr('id', "tennisCourt")
            .css({
                'font-size': '11pt',
                'width': '100%',
                'display': 'flex',
                'justufy-content': 'center',
            })
            .appendTo(this.card.content);

        this.tennisCourtImage = $('<img></img>')
            .attr("src", "../../css/images/tennisCourt.jpg")
            .css({
                'width': '100%',
            })
            .appendTo(this.viewerNode);

        let tennisCourt = document.getElementById('tennisCourt');
        let ball;
        for (var i = 0; i < ballCount; i++) {
            ball = document.createElement('ion-icon');
            ball.classList.add('tennisBall');
            ball.setAttribute("name", "tennisball");
            ball.setAttribute("id", `TBall${i}`);
            ball.style.top = "-10%";
            ball.style.left = "-10%";
            tennisCourt.appendChild(ball);
        }
        
        ball = document.createElement('ion-icon');
        ball.classList.add('tennisBall');
        ball.setAttribute("name", "tennisball");
        ball.setAttribute("id", "goalBall");
        ball.style.color = "red";
        ball.style.top = "-10%";
        ball.style.left = "-10%";
        tennisCourt.appendChild(ball);

        this.viewerNodeFadeTimeout = null;

        super.onCreate();
    }

    onData(data) {
        this.card.title.text(data._topic_name);
        let tennisCourt = document.getElementById('tennisCourt');
        let courtWidth = 14;
        let courtheight = 25.78;
        if (data['ns'] == "balls") {
            let i;
            for (i = 0; i < data['points'].length; i++) {
                let ball = document.getElementById(`TBall${i}`);
                var toploc = ((courtheight / 2) - parseFloat(data['points'][i]['x'])) / courtheight * 100 + "%";
                var leftloc = ((courtWidth / 2) - parseFloat(data['points'][i]['y'])) / courtWidth * 100 + "%";
                ball.style.top = toploc;
                ball.style.left = leftloc;
            }
            for (; i < ballCount; i++) {
                let ball = document.getElementById('TBall' + i);
                ball.style.top = "-10%";
                ball.style.left = "-10%";
            }
        }

        if (data['ns'] == "MoveToBallGoal") {
            let ball = document.getElementById('goalBall');
            if (data['points'].length != 0) {
                ball.style.top = ((courtheight / 2) - parseFloat(data['points'][0]['x'])) / courtheight * 100 + "%";
                ball.style.left = ((courtWidth / 2) - parseFloat(data['points'][0]['y'])) / courtWidth * 100 + "%";
            }
            else {
                ball.style.top = "-10%";
                ball.style.left = "-10%";
            }
        }

        let robot = State.get('robotLocation');
        if (typeof robot != "undefined") {
            try {
                document.getElementById('viveRobot').remove();
            } catch { }
            let robotIcon = document.createElement('ion-icon');
            robotIcon.classList.add('tennisBall');
            robotIcon.setAttribute('name', "caret-up-circle");
            robotIcon.setAttribute('id', "viveRobot");
            var toploc = ((courtheight / 2) - parseFloat(robot.x)) / courtheight * 100 + "%";
            var leftloc = ((courtWidth / 2) - parseFloat(robot.y)) / courtWidth * 100 + "%";
            robotIcon.style.transform = `rotate(${robot.z}deg)`;
            robotIcon.style.color = "#a3f5f7";
            robotIcon.style.fontSize = "20px";
            robotIcon.style.top = toploc;
            robotIcon.style.left = leftloc;
            tennisCourt.appendChild(robotIcon);
        }

    }
}

BallsViewer.friendlyName = "ball data";

BallsViewer.supportedTypes = [
    "visualization_msgs/msg/Marker",
];

Viewer.registerViewer(BallsViewer);
