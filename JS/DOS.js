var audioCtx;
var BadCommandLimit=10;

function wait(ms) {
    var start = new Date().getTime();
    var end = start;
    while (end < start + ms) {
        end = new Date().getTime();
    }
}

function beep(Freq, Duration) {
	
	try {
	
	if (audioCtx == null) 
	{
        audioCtx = new(window.AudioContext || window.webkitAudioContext)();
    }
	
    var oscillator = audioCtx.createOscillator();
    var gainNode = audioCtx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    gainNode.gain.value = 0.5;
    oscillator.frequency.value = Freq;
    oscillator.type = "square";

    oscillator.start();
    //wait(Duration);
    oscillator.stop();
	
	}
	
	catch(err) {
		conole.log(err.message);		
	}

}

function TheyArePersistent() {

    beep(440, 500);
    beep(440, 500);
    beep(440, 500);
    beep(349, 350);
    beep(523, 150);
    beep(440, 500);
    beep(349, 350);
    beep(523, 150);
    beep(440, 1000);
    beep(659, 500);
    beep(659, 500);
    beep(659, 500);
    beep(698, 350);
    beep(523, 150);
    beep(415, 500);
    beep(349, 350);
    beep(523, 150);
    beep(440, 1000);
    WriteToDos(ShowVader());

}

function GetLastCMD() {
    $('span.dos-cmdline').last().focus();
}

function ExitToDos() {
    document.body.innerHTML = "";
    document.body.style.backgroundColor = "black";
    document.body.style.Color = "white";
    document.body.setAttribute("onclick", "GetLastCMD()");
	
	var elemCRT = document.createElement('div');
	elemCRT.classList.add('crt');
	
    var elemDiv = document.createElement('div');
    elemDiv.setAttribute("id", "MSDOS");
    elemDiv.innerHTML = "Starting MS-DOS...</br></br>HIMEM is testing extended memory...done. </br></br>";
    document.body.appendChild(elemCRT);
    document.body.appendChild(elemDiv);
    WriteToDos(null);
}
var BadCommandCount = 0;

function BadCommand() 
{

    BadCommandCount++;

    if (BadCommandCount <= BadCommandLimit) {
        beep(1888, 250);
    } else {
        BadCommandCount = 0;
          TheyArePersistent();
    }
    WriteToDos("Bad command or filename");

}

function WriteToDos(output, showcursor) {

    var prompt = "C:\\>";
    var showcursor = 1;
    if (output != null) {
        prompt = "";
        showcursor = 0;
    }

    var DosPromptLine = $("<div/>", {
        "class": "dos",
    });

    var DosPromptLineL = $("<div/>", {
        "class": "dos-l",
    });

    DosPromptLineL.append(prompt);
    DosPromptLine.append(DosPromptLineL);

    var DosPromptLineR = $("<div/>", {
        "class": "dos-r",
    });

    var calret = $("<pre/>", {

        class: "dos-caret",
    });


    var DosPromptInput = $("<span/>", {
        class: "dos-cmdline",
        contenteditable: true,
        onkeydown: "UserInput(this)",
        spellcheck: false,
        text: output,
    });

    calret.append(DosPromptInput);

    if (showcursor) {
        var Cursor = $("<span/>", {
            "class": "cursor",
            "text": " "
        });


        calret.append(Cursor);
    }

    DosPromptLineR.append(calret);
    DosPromptLine.append(DosPromptLineR);

    $('#MSDOS').append(DosPromptLine);
    window.scrollTo(0, document.body.scrollHeight);
    DosPromptInput.focus();
}

function ShowDir() {
    var DIR = ""
    DIR += " Volume in drive C is MS-DOS_6\r\n";
    DIR += " Volume Serial Number is 420-69\r\n";
    DIR += " Directory of C:\\ \r\n\r\n";
    DIR += "NEVER\tRIK\t5.0\t27-07-87\r\n";
    DIR += "GONNA\tRIK\t5.0\t27-07-87\r\n";
    DIR += "GIVE\tRIK\t4.0\t27-07-87\r\n";
    DIR += "YOU\tRIK\t3.0\t27-07-87\r\n";
    DIR += "UP\tRIK\t2.0\t27-07-87\r\n";
    DIR += "\t5 file(s)\t19,000 bytes\r\n";
    DIR += "\t\t\t 2,111,045.632 bytes free\r\n";
    return DIR;
}

function ShowVader() {
    var VADER = "\r\n"
    VADER += "         _.-'~~~~~~'-._            \r\n";
    VADER += "        /      ||      \\          \r\n";
    VADER += "       /       ||       \\         \r\n";
    VADER += "      |        ||        |         \r\n";
    VADER += "      | _______||_______ |         \r\n";
    VADER += "      |/ ----- \\/ ----- \\|       \r\n";
    VADER += "     /  (     )  (     )  \\       \r\n";
    VADER += "    / \\  ----- () -----  / \\     \r\n";
    VADER += "   /   \\      /||\\      /   \\   \r\n";
    VADER += "  /     \\    /||||\\    /     \\  \r\n";
    VADER += " /       \\  /||||||\\  /       \\ \r\n";
    VADER += "/_        \\o========o/        _\\ \r\n";
    VADER += "  '--...__|'-._  _.-'|__...--'     \r\n";
    VADER += "          |    ''    |             \r\n";
	VADER += "\r\n"
    return VADER;
}


function UserInput(i) {
    if (event.keyCode === 13) {
        var userLine = $(i).text();
        event.preventDefault();
        $(i).parent().children("span.cursor").remove();

        $(i).prop('contenteditable', false);

        switch (userLine.toLowerCase().trim().split(' ')[0].split('.')[0]) {
            case "dir":
                WriteToDos(ShowDir());
                break;
            case "hostname":
                WriteToDos("w.o.p.r");
                break;
            case "echo":
                WriteToDos("Shall we play a game?");
                break;
            case "whoami":
                WriteToDos("Greetings professor falken");
                break;
            case "restart":
                location.reload();
                break;
            default:
                BadCommand();
        }

        WriteToDos(null);
        GetLastCMD();
    }
}




