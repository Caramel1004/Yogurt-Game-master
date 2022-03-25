/* 오류
1. 지름길 미선택 시 말이 움직이지 않음. -->해결
2. 모서리를 지나서 말이 이동하면 그 후론 말이 움직이지 않는다. -->해결
3. 수집한 재료가 저장되지 않는다. -->지나간 곳만 재료가 수집 되도록 한다. -->미구현
4. 대각선으로 이동시 이동종류가 두번 나오는 오류 -->해결
5. 마지막 결승점에 골인되지 않고 반대로 말이 이동하는 현상 -->해결
6. 이동거리 스택이 쌓이지 않아서 오류남 --> 해결
7. 윷이나 모가 나올 경우 윷을 한번 더 던지게 하여 윷스택을 쌓고 플레이어가 원하는대로 이동종류를 선택해 움직 일수 하는것 --> 배열 yutStack에 쌓인 이동종류들을 버튼으로 생성하는데 까지는 구현 함수가 실행되지 않아 주석처리
8. 1P 2P 윷말 여러개 생산, 모든 말이 결승점에 들어와야 게임이 끝나도록 한다.-->해결 -->말을 무작위로 선택하여 움직 일 수 있게 하는 경우는 미구현,순서대로 말이 입장한다.
9. 이동하는 말이 3개 이상 되도록 한다. --> 미구현 
10. 2인으로 맞춰 알고리즘을 구현 해서 1인용 이용시 말이 움직이지 않는 참고 바랍니다.

###게임 실행 시 객체를 생성하는 함수
init(personNum) --> 윷 말 생성 : Rect(x, y, width, height, color) --> drawStuff()

###윷 말의 이동 알고리즘 구성 함수

yutThrow() --> 테두리 경로 : edgeCounter() --> yutCoordinate(parameter) --> horseCatch(x,y,idx) --> 윷 말 위치가 같을시 yutThrow() 리턴 --> 
           --> 대각선 경로(지름길) :  edgeDiagonalCounter() --> yutDiagonalCoordinate(parameter) --> horseCatch(x,y,idx) --> 윷 말 위치가 같을시 yutThrow() 리턴
 */

window.onload = init;

//Audio 객체 참조변수 선언
var audio = new Audio( "image/까치설날.mp3" );

var ctx, throwResult;
//각각의 윷 말 이동 거리스택을 배열로 저장하는 변수,총 이동 거리 스택
var edge = [];
var firstEdge = [];//첫번째 모서리부터 시작하는 이동거리 스택 --> 이동거리스택 5인 경우edge[idx]가 firstEdge[idx]에 값을 넘겨줌
var secondEdge = [];//두번쨰 모서리 부터 시작하는 이동거리 스택


//각 플레이어의 윷놀이 말 여러개를 해당 배열에 저장하는 변수
var r1 =[];//1P 윷놀이 말
var r2 =[];//2P 윷놀이 말

//이동거리 스택이 5의배수인 경우 5,10,15
//지름길 유무를 배열에 저장하는 변수
//요솟값이 0 이면 false 1이면 true
var msg1 = [];//첫번째 모서리 알림창
var msg2 = [];//두번째 모서리 알림창
var msg3 = [];//세 번째 가운데 알림창 

//1P,2P말을 stuff배열에 저장
var stuff = [];

//stuff의 배열번호
var stuffIndex = 0;

var yut, yutyut;

//말의 이동 종류를 배열로 선언
//0:도, 1:개, 2:걸, 3:윷, 4:모
const yutArray = [ '도', '개', '걸', '윷', '모' ];

//실시간으로 쌓이는 윷 종류
var yutStack = [];

//요리 재료 이미지들을 배열로 선언
//0:계란, 1:김, 2:떡, 3:만두 , 4:멸치, 5:소, 6:파
const cook = ['image/계란.png', 
	'image/김.png', 
	'image/떡.png', 
	'image/만두.png', 
	'image/멸치.png', 
	'image/소.png', 
	'image/파.png'];

//수집한 이미지 요리 재료를 배열로 저장
var cookStuff = [];

//점수표
var score = [];


//---------------------------------------------------------------------

//by 우영, 각 페이지 이동버튼
//게임 시작 페이지 -> 1,2인용 선택 페이지
document.getElementById("personNumBtn")
.addEventListener("click", function() {
	document.getElementById("start").hidden = true;
	document.getElementById("select").hidden = false;
}, false);

//1,2인용 선택 페이지 -> 게임 페이지
document.getElementById("startBtn")
.addEventListener("click", function() {
	document.getElementById("select").hidden = true;
	document.getElementById("yut").hidden = false;
}, false);


//게임 설명 페이지 -> 1,2인용 선택 페이지
document.getElementById("startbtn2")
.addEventListener("click", function() {
	document.getElementById("info").hidden = true;
	document.getElementById("select").hidden = false;
}, false);

//게임 시작 페이지 -> 게임 설명 페이지
document.getElementById("infobtn")
.addEventListener("click", function() {
	document.getElementById("start").hidden = true;
	document.getElementById("info").hidden = false;
}, false);

//게임 설명 페이지 -> 게임 시작 페이지
document.getElementById("backbtn")
.addEventListener("click", function() {
	document.getElementById("info").hidden = true;
	document.getElementById("start").hidden = false;
}, false);

//게임 페이지 -> 게임 시작 페이지
document.getElementById("backbtn2")
.addEventListener("click", function() {
	document.getElementById("yut").hidden = true;
	document.getElementById("start").hidden = false;
}, false);

//-----------------------------------------------------------------------

//by 우영, 기능 : 게임 시작시 필요한 객체를 생성하는 함수
//if 조건문을 사용하여 파라미터값이 1인 경우 윷놀이 말 1P 3개만 생성, 
//파라미터값이 2인 경우 1P 2P 각각 윷놀이 말 3개 생성 
var personNumber = 0;
function init(personNum){
	var canvas = document.getElementById('myCanvas');
	ctx = canvas.getContext('2d');

	// yutyut = document.getElementById('yutyut');
	// yut = document.getElementById('yut');

	//윷놀이 말의 X축 위치 증분 값
	var xPlus = 0;

	//파라미터값이 1인 경우 말 1P 3개만 생성
	if(personNum == 1){
		personNumber = personNum;
		//첫 말은 시작점에 위치
		r1[0] = new Rect(510,520,20, 20, "pink");
		stuff.push(r1[0]);
		edge.push(0);
		firstEdge.push(0);
		secondEdge.push(0);
		msg1.push(0);
		msg2.push(0);
		msg3.push(0);
		score.push('빈 자리');

		for(var k = 1; k < 3; k++){
			r1[k] = new Rect(600+xPlus,570,20,20, "pink");
			stuff.push(r1[k]);
			edge.push(0);
			firstEdge.push(0);
			secondEdge.push(0);
			msg1.push(0);
			msg2.push(0);
			msg3.push(0);
			score.push('빈 자리');
			xPlus+=40;
		}
		drawStuff();
		console.log("1인 게임 시작!");

		//파라미터값이 2인 경우 1P 2P 각각 윷놀이 말 3개 생성
	}else if(personNum == 2){
		personNumber = personNum;
		//1P 윷놀이 말 객체 생성
		//stuff[0,1,2] : 1P 핑크말
		r1[0] = new Rect(495,520,20, 20, "pink");//첫 말은 시작점에 위치
		stuff.push(r1[0]);
		edge.push(0);
		firstEdge.push(0);
		secondEdge.push(0);
		msg1.push(0);
		msg2.push(0);
		msg3.push(0);
		score.push('빈 자리');

		for(var k = 1; k < 3; k++){
			r1[k] = new Rect(600+xPlus,570,20,20, "pink");
			stuff.push(r1[k]);
			edge.push(0);
			firstEdge.push(0);
			secondEdge.push(0);
			msg1.push(0);
			msg2.push(0);
			msg3.push(0);
			score.push('빈 자리');
			xPlus+=40;
		}

		//2P 윷놀이 말 객체 생성
		//stuff[3,4,5] : 2P 블루말
		r2[0] = new Rect(530,520,20, 20, "blue");//첫 말은 시작점에 위치
		stuff.push(r2[0]);
		edge.push(0);
		firstEdge.push(0);
		secondEdge.push(0);
		msg1.push(0);
		msg2.push(0);
		msg3.push(0);
		score.push('빈 자리');

		for(var k = 1; k < 3; k++){
			r2[k] = new Rect(610+xPlus,570,20,20, "blue");
			stuff.push(r2[k]);
			edge.push(0);
			firstEdge.push(0);
			secondEdge.push(0);
			msg1.push(0);
			msg2.push(0);
			msg3.push(0);
			score.push('빈 자리');
			xPlus+=40;
		}
		drawStuff();

		//{"x":495,"y":520,"width":20,"height":20,"color":"pink"} --> r1[0] stuff[0]
		//{"x":530,"y":520,"width":20,"height":20,"color":"blue"} --> r2[0] stuff[3]
		console.log("2인 게임 시작!\n1P 윷 말 : "+JSON.stringify(stuff[0].color)+"\n2P 윷 말 : "+JSON.stringify(stuff[3].color));
		//[0,0,0,0,0,0]
		console.log("각 윷말의 이동거리 스택\n"+JSON.stringify(edge));
		console.log("각 윷말의 첫번째 모서리 출발점 이동거리 스택\n"+JSON.stringify(firstEdge));
		console.log("각 윷말의 두번째 모서리 출발점 이동거리 스택\n"+JSON.stringify(secondEdge));
		//['빈자리','빈자리','빈자리','빈자리','빈자리','빈자리']
		console.log("점수 상황"+JSON.stringify(score));
		//[0,0,0,0,0,0]
		console.log("지름길 유무\nmsg1"+JSON.stringify(msg1)+"\nmsg2"+JSON.stringify(msg2)+"\nmsg3"+JSON.stringify(msg3));
		console.log("윷놀이 시작!---------------------------------------------");
	}
}

//-----------------------------------------------------------------------------

//by 우영, 기능 : 두 윷 말이 서로 같은 위치에 있는지 판별하는 함수
//반복문을 사용하여 stuff배열에 있는 모든 요소와 검사한다.
//x축 y축 값이 같으면 이동거리 스택 지름길유무를 모두 0으로 저장
//잡힌 말은 출발점으로 이동.
function horseCatch(x,y,idx){

	//score 배열 안에 있는 요소값 'pink' 갯수와 'blue'를 구하는 과정입니다.
	//도착한 pink말 blue말이 몇개인지 계산
	//'pink' 와 'blue'갯수 구하기
	//filter함수로 구한 특정 요소 값을 새로운 배열로 생성. 요솟수가 곧 구하고자하는 요소값 갯수
	var pinkCount = score.filter(element => 'pink' === element).length;//'pink'로 저장된 요소값 갯수
	var blueCount = score.filter(element => 'blue' === element).length;//'blue'로 저장된 요소값 갯수

	for(var j = 0; j < stuff.length; j++){
		//이번턴에 위치된 윷말의 x,y 좌표값을 파라미터로 받고 stuff배열 안에 있는 윷 말들의 x좌표 y좌표 값 같고 두 말의 색이 다르며 아직 결승점에 들어가지 못한 말 일때
		if(stuff[j].x == x && stuff[j].y == y && stuff[j].color!=stuff[idx].color && score[idx] == '빈 자리'){
			//score[idx] == '빈 자리' -->해당 인덱스를 갖는 말이 아직 결승점에 들어가지 않은 상태
			//잡히면 모든 값을 0으로 초기화 시키고 출발점으로 이동시킨다.
			edge[j]=firstEdge[j]=secondEdge[j]=msg1[j]=msg2[j]=msg3[j]=0;
			stuff[j].x = 520;
			stuff[j].y = 520;
			alert(stuff[j].color+"말을 잡았습니다!\n윷을 자동으로 던집니다!");
			drawStuff();
			return yutThrow();
		}
	}

	//위치가 정해지면 상대방으로 턴이 넘어 갑니다.
	//'pink'요소값 갯수 3개미만 'blue'요소 값 갯수3개미만 그리고 2인용일때,
	if((pinkCount <3 || blueCount <3) && personNumber==2){
		/*k=0;*/
		//임시 저장 변수
		var temp = 0;
		if(stuffIndex <= 2){
			alert("2P(blue) 턴으로 넘어갑니다.");
			for(var j=3; j < score.length; j++){
				//score배열에 빈자리 인 경우 아직 결승점에 도착하지 못한 것이므로
				//빈자리를 요소값으로 갖는 요소 인덱스를 찾는다.
				if(score[j] == '빈 자리'){
					//해당 인덱스를 temp에 저장
					temp = j;
					console.log("다음턴 인덱스"+temp);
					break;
				}
			}
			stuffIndex = temp;
		}else{
			alert("1P(Pink) 턴으로 넘어갑니다.");
			for(var j=0; j < 3; j++){
				//score배열에 빈자리 인 경우 아직 결승점에 도착하지 못한 것이므로
				//빈자리를 요소값으로 갖는 요소 인덱스를 찾는다.
				if(score[j] == '빈 자리'){
					//해당 인덱스를 temp에 저장
					temp = j;
					console.log("다음턴 인덱스"+temp);
					break;
				}
			}
			//다음 턴으로 넘길 수 있도록 temp값을 현재 수행 해야 할 다음 턴 윷말의 인덱스 저장
			stuffIndex = temp;
		}//if~else 2nd	
	}//if 1st

}

//-----------------------------------------------------------------------------

//by 우영, Audio클래스를 이용하여 play메소드와 pause 메소드를 사용하여 오디오 play/pause
function audioSwitch(){
	if(audio.paused == true){
		audio.play();
	}else audio.pause();
}

//--------------------------------------------------------------------------

//by 우영, 기능 : 윷을 던지고 나서 무작위로 말의 이동종류를 뽑는 함수
//Math 클래스의 random 메소드를 사용하여 난수 생성, floor 메소드를 사용하여 정수값으로 변환
//생성된 난수는 배열 번호(인덱스)로 지정, yutArray는 도 개 걸 윷 모를 각각 배열요소로 저장된 문자열 배열 변수
//yutArray.length == 4 이므로 난수 범위는 0~4
function yutThrow(){
	//윷 스택배열 요솟수
	var n = yutStack.length;

	//edge[stuffIndex] : edge배열의 요소,각각의 윷 말 이동거리 스택
	//각각의 말이 첫 시행 전에는 edge[stuffInde]가 모두 0
	//0=<edge[stuffIndex]<20 테두리 경로에서만 영향을 준다 그리고 모든 모서리에서 지름길 미동의시 테두리 경로만 관여
	if((edge[stuffIndex] >=0 && edge[stuffIndex] < 20) && (msg1[stuffIndex] == 0 && msg2[stuffIndex] == 0 && msg3[stuffIndex] == 0)){
		//생성된 난수는 yutArray배열의 인덱스로 지정되고 yutArray의 배열요소를 가리키게된다.
		//그 요소값을 전역변수 throwResult변수에 저장한다.
		throwResult = yutArray[Math.floor(Math.random() * yutArray.length)];
		alert(throwResult);		
		//윷이나 모이거나 moveCount배열길이가 0이 아닌 경우 yutStackPush() 함수 실행
		//첫 시행시 moveCount 배열길이는 0이고 도 개 걸인 경우 yutMove()함수 실행
		//(n != 0 || (throwResult == '윷' || throwResult == '모')) ? yutStackPush() : edgeCounter();
		
		//테두리 경로에서 이동거리 스택을 세는 함수
		edgeCounter();
		if(personNumber==2){
			//두 윷 말이 서로 같은 위치에 있는지 판별하는 함수
			horseCatch(stuff[stuffIndex].x,stuff[stuffIndex].y,stuffIndex);
		}
		drawStuff();
		
		//5<=firstEdge[stuffIndex]<11 이면서 첫번째 모서리에서 지름길 동의 인 경우
	}else if(firstEdge[stuffIndex] >= 5 && firstEdge[stuffIndex] < 11 && msg1[stuffIndex]!=0){
		throwResult = yutArray[Math.floor(Math.random() * yutArray.length)];
		alert(throwResult);
		
		//대각선(지름길)경로에서 이동거리 스택을 세는 함수
		edgeDiagonalCounter();
		if(personNumber==2){
			//두 윷 말이 서로 같은 위치에 있는지 판별하는 함수 
			horseCatch(stuff[stuffIndex].x,stuff[stuffIndex].y,stuffIndex);
		}
		drawStuff();	
	}else if(secondEdge[stuffIndex] >=10 && msg2[stuffIndex]!=0){
		throwResult = yutArray[Math.floor(Math.random() * yutArray.length)];
		alert(throwResult);
		//대각선(지름길)경로에서 이동거리 스택을 세는 함수
		edgeDiagonalCounter();
		if(personNumber==2){
			//두 윷 말이 서로 같은 위치에 있는지 판별하는 함수
			horseCatch(stuff[stuffIndex].x,stuff[stuffIndex].y,stuffIndex);
		}
		drawStuff();
	}
	console.log("edge["+stuffIndex+"] 스택 : "+edge[stuffIndex]);
	console.log("firstEdge["+stuffIndex+"] 스택 : "+firstEdge[stuffIndex]);
	console.log("secondEdge["+stuffIndex+"] 스택 : "+secondEdge[stuffIndex])
	console.log("점수 상황"+JSON.stringify(score));
	console.log("턴 종료----------------------------------------------------------");

}

//-----------------------------------------------------------------------------


//코드오류로 인해 주석 처리

//by 우영, 기능 : 윷이나 모가 나올 경우 윷을 한번 더 던져야 하므로 나오는 윷 종류를 yutStack 배열 요소로 저장하는 함수-->추가
//배열 순서대로 버튼생성
//ex) 첫번째 시행 : 모, 두번째 시행 : 도 --> yutStack[0] = '모', yutStack[1] = '도'
/*var k = 0;//반복문 초기값으로 쓰기 위한 증분
function yutStackPush(){
	var yutStackElement = document.getElementById('yutStack');//버튼 찍을 변수
	if(throwResult == '윷'){
		yutStack.push(throwResult);
		//윷 스택을 실시간으로 확인 하도록 반복문으로 윷 종류가 적힌 버튼 생성
		for(k; k < yutStack.length; k++){
			yutStackElement.innerHTML+=
				"<button type='submit' onclick='yutStackSelect("+yutStack[k]+","+k+");'>"+yutStack[k]+"</button>";
		}
		alert('윷을 한번 더 던지세요.');
		console.log("yutStack :"+JSON.stringify(yutStack));
	}else if(throwResult == '모'){
		yutStack.push(throwResult);
		for(k; k < yutStack.length; k++){
			yutStackElement.innerHTML+=
				"<button type='submit' onclick='yutStackSelect("+yutStack[k]+","+k+");'>"+yutStack[k]+"</button>";
		}
		alert('윷을 한번 더 던지세요.');
		console.log("yutStack :"+JSON.stringify(yutStack));
	}else{
		//마지막 시행에서 도,개,걸이 나오는 경우
		yutStack.push(throwResult);
		for(k; k < yutStack.length; k++){
			yutStackElement.innerHTML+=
				"<button type='submit' onclick='yutStackSelect("+yutStack[k]+","+k+");'>"+yutStack[k]+"</button>";
		}
		console.log("yutStack :"+JSON.stringify(yutStack));
		console.log("k :"+k);
	}
}*/

//-------------------------------------------------------------------------------------------------------

//by 우영, 기능 : yutStack에 있는 윷 이동종류를 하나씩 꺼내서 이동할 수 있도록 하는 매개 함수 
/*function yutStackSelect(yutElementStack,idx){
	console.log("idx :"+idx);
	throwResult = yutElementStack;
	yutStack.splice(idx);
	edgeCounter();
}*/


//-------------------------------------------------------------------------------------------------------

//by 우영, 기능 : 윷의 이동종류에 따라 이동 거리 수치를 정하는 함수
//윷의 이동종류에 따라 거리 계산 --> 도 개 걸 윷 모 : 1 2 3 4 5
function edgeCounter(){
	//이동 해야 할 거리 수치 변수
	var parameter = 0;

	//일자 구간에서 일자 구간 이동 일 경우 꺾이는 위치가 없으므로 5로 나눈 나머지를 구할 필요가 없으므로 같은 구간일 경우
	//스위치문에서 저장된 parameter값 그대로 yutCoordinate함수로 파라미터 값을 보내준다.
	var beforeSection = '윷 던지기 전 말의 구간';
	var afterSection = '윷 던진 후 윷 말의 구간';
	//구간 임시저장 A구간 1 2 3 4 5, B구간 6,7,8,9,10, C구간 11,12,13,14,15, D구간 16,17,18,19,20
	//이동 전 어디 구간인지 임시로 저장
	if(edge[stuffIndex]<=5){
		beforeSection = 'A';
	}else if(edge[stuffIndex] > 5 && edge[stuffIndex] <= 10){
		beforeSection = 'B';
	}else if(edge[stuffIndex] >10 && edge[stuffIndex] <= 15){
		beforeSection = 'C';
	}else if(edge[stuffIndex] >15 && edge[stuffIndex] <= 20){
		beforeSection = 'D';
	}

	//yutThrow()함수에 의해  저장된 throwResult값을 조건식으로 사용
	//throwResult값은 도 개 걸 윷 모 중 하나
	switch (throwResult) {
	case '도':
		//이동거리 스택 1증가
		edge[stuffIndex] += 1;
		//이동 해야 할 수치
		parameter = 1;
		break;
	case '개':
		//이동거리 스택 2증가
		edge[stuffIndex] += 2;
		//이동 해야 할 수치
		parameter = 2;
		break;
	case '걸':
		//이동거리 스택 3증가
		edge[stuffIndex] += 3;
		//이동 해야 할 수치
		parameter = 3;
		break;
	case '윷':
		//이동거리 스택 4증가
		edge[stuffIndex] += 4;
		//이동 해야 할 수치
		parameter = 4;
		break;
	case '모':
		//이동거리 스택 5증가
		edge[stuffIndex] += 5;
		//모인 경우는 밑에 조건문에서 처리
		break;
	default:
		break;
	}	

	//이동 후 어디 구간인지 임시로 저장
	if(edge[stuffIndex]<=5){
		afterSection = 'A';
	}else if(edge[stuffIndex] > 5 && edge[stuffIndex] <= 10){
		afterSection = 'B';
	}else if(edge[stuffIndex] >10 && edge[stuffIndex] <= 15){
		afterSection = 'C';
	}else if(edge[stuffIndex] >15 && edge[stuffIndex] <= 20){
		afterSection = 'D';
	}

	//이동 해야 할 거리 수치
	//5를 나눈 나머지로 이동 해야 할 거리 수치를 구한다.
	//몫이 5의배수이면 나머지가 0 인데 상관없다.
	//yutCooredinate() 함수에서 egde[stuffIndex] 5 10 15 20인 경우를 위치로 따로 구현
	//5x1+0 5x1+1 5x1+2 5x1+3 5x1+4 5x2+0.....
	//ex) egde[stuffIndex] == 6이면  두가지로 판단 할 수 있다.
	//1.꺾이는 위치 5에서 도가 나와 x축으로 1 이동 하는 경우
	//2.꺾이는 위치가 아닌 곳에서 x축으로 1 이동 해야 하는 경우
	//6 = 1+5=2+4=3+3=4+3=5+1 --> 경우의 수 2번인 경우다.
	//꺾이는 위치를 기준으로 이동해야 하므로 꺾이는 위치가 5이다. 순서까지 고려하여 6을 자연수 2가지 수로  분할 할 수 있는 경우의 수는 5가지인데 1 2 3 4에서는 x축으로 이동 할 수 없으므로
	//x축으로 이동해야 할 수치만 구해서 파라미터값을 yutCooredinate(parameter)함수로 보내주기만 하면 된다. 따라서  우리는 몫을 5로 나눈 나머지만 구하면 된다.
	if(edge[stuffIndex] >= 5 && beforeSection != afterSection){	
		parameter = edge[stuffIndex] % 5;
		console.log("edge["+stuffIndex+"] % 5 : "+parameter);	
	}

	//by 우영, 윷의 위치함수
	//이동해야 할 거리 수치 변수 값을 파라미터값으로 넘겨준다. 
	yutCoordinate(parameter);
}

//--------------------------------------------------------------------------------------------------------

//by 우영, 기능 : 테두리 경로 윷의 위치 함수
//edge[stuffIndex] : edge배열의 요소,윷 말의 이동거리 스택이 저장된 요소를 가지고
//말이 이동해야할 거리를 판단하고 x,y축 좌표값을 찍어주는 함수
function yutCoordinate(parameter){
	var direction;//x축,y축 방향 정하는 지역변수

	//이동거리 스택 : 10 < edge[stuffIndex] < 15 or edge[stuffIndex] < 5
	if(edge[stuffIndex] < 5 || (edge[stuffIndex] > 10 && edge[stuffIndex] < 15)){
		//10 < edge[stuffIndex] < 15이면 x좌표값 50으로 고정
		if((edge[stuffIndex] > 10 && edge[stuffIndex] < 15)){
			stuff[stuffIndex].x = 50;
			//edge[stuffIndex] < 5이면 x좌표값 510으로 고정
		}else if(edge[stuffIndex] < 5){
			stuff[stuffIndex].x = 510;
		}
		//삼항연산자 -->
		//방향 판단 : 위쪽이면 y값이 일정한 상수로 92씩 감소,아랫쪽 이면 y값이 일정한 상수로 92씩 증가
		//(parameter-1)번 움직인다.
		for(var j = 0; j < parameter; j++){
			direction = edge[stuffIndex] < 5 ? stuff[stuffIndex].y -= 92 : stuff[stuffIndex].y += 92;	
		}

		console.log("x좌표 위치 : "+stuff[stuffIndex].x+", y좌표 위치 : "+direction);
		drawStuff();

		//이동거리 스택 : 5 < edge[stuffIndex] <10  or 15 < edge[stuffIndex] < 20
	}else if((edge[stuffIndex] > 5 && edge[stuffIndex] < 10) || (edge[stuffIndex] > 15 && edge[stuffIndex] < 20)){	
		//5 < edge[stuffIndex] < 10이면 y좌표값 55으로 고정
		if(edge[stuffIndex] > 5 && edge[stuffIndex] < 10){
			stuff[stuffIndex].y = 55;	
			//15 < edge[stuffIndex] < 20이면 y좌표값 530으로 고정
		}else if(edge[stuffIndex] > 15 && edge[stuffIndex] < 20){
			stuff[stuffIndex].y = 530;
		}

		//방향 판단 : 왼쪽이면 x값이 일정한 상수로 90씩 감소,오른쪽 이면 x값이 일정한 상수로 90씩 증가
		//(parameter-1)번 움직인다.
		for(var j = 0; j < parameter; j++){
			direction = edge[stuffIndex] > 5 && edge[stuffIndex] < 10 ? stuff[stuffIndex].x -= 90 : stuff[stuffIndex].x += 90;
		}

		console.log("x좌표 위치 : "+direction+", y좌표 위치 : "+stuff[stuffIndex].y);
		drawStuff();

		//모서리 부분 : 5의배수
	}else if(edge[stuffIndex] == 5,10,15 || edge[stuffIndex] >= 20){
		var conMessage = 0;
		//조건 : 이동거리 스택 값이 5의배수인 경우
		switch(edge[stuffIndex]){
		//첫 모서리 위치
		//윷 말의 이동거리 스택 값이 5인 경우
		//xy좌표 값  x : 510, y : 55
		case 5 :
			stuff[stuffIndex].x = 510;
			stuff[stuffIndex].y = 55;
			console.log("x좌표 위치 : "+stuff[stuffIndex].x+", y좌표 위치 : "+stuff[stuffIndex].y);
			//대각선 경로가 있으므로 지름길 유무를 판단하는 알림창 생성
			conMessage = confirm("선택의 순간! 지름길로 가시겠습니까?"); 
			if(conMessage == true){
				msg1[stuffIndex] = conMessage;
				firstEdge[stuffIndex] = edge[stuffIndex];
				console.log("firstEdge["+stuffIndex+"] 스택 : "+firstEdge[stuffIndex]);
			}
			break;
			//두번째 모서리 위치
			//윷 말의 이동거리 스택 값이 10인 경우
			//xy좌표 값  x : 50, y : 55
		case 10 :
			stuff[stuffIndex].x = 50;
			stuff[stuffIndex].y = 55;
			console.log("x좌표 위치 : "+stuff[stuffIndex].x+", y좌표 위치 : "+stuff[stuffIndex].y);
			//대각선 경로가 있으므로 지름길 유무를 판단하는 알림창 생성
			conMessage = confirm("선택의 순간! 지름길로 가시겠습니까?"); 
			if(conMessage == true){
				msg2[stuffIndex] = conMessage;
				secondEdge[stuffIndex] = edge[stuffIndex];
			}
			break;
			//세번째 모서리 위치
			//윷 말의 이동거리 스택 값이 10인 경우
			//xy좌표 값  x : 50, y : 530
			//#지름길 없음
		case 15 :
			stuff[stuffIndex].x = 50;
			stuff[stuffIndex].y = 530;
			console.log("x좌표 위치 : "+stuff[stuffIndex].x+", y좌표 위치 : "+stuff[stuffIndex].y);
			break;

		}

		//테두리경로로 이동거리 스택이 20이상인 결승점 도착이므로
		if(edge[stuffIndex] >= 20){
			//score[stuffIndex]에 도착한 말의 색을 저장
			//score 배열에서 'pink' or 'blue'를 요소값으로 갖는 요소들이 3개면 게임 종료
			score[stuffIndex] = stuff[stuffIndex].color;

			//도착한 pink말 blue말이 몇개인지 계산
			//'pink' 와 'blue'갯수 구하기
			//filter함수로 구한 특정 요소 값을 새로운 배열로 생성. 요솟수가 곧 구하고자하는 요소값 갯수
			var pinkCount = score.filter(element => 'pink' === element).length;//'pink'로 저장된 요소값 갯수
			var blueCount = score.filter(element => 'blue' === element).length;//'blue'로 저장된 요소값 갯수
			//score배열에 'pink'가 3이상이면
			//게임을 끝내고 결과창으로 이동시킨다.
			if(pinkCount >=3){
				alert(stuff[stuffIndex].color+" : "+(stuffIndex+1)+"번 말이 도착했습니다.");
				alert('pink말이 승리 하였습니다.\n 수집한 재료로 떡국 만들러 GoGo~!');
				document.getElementById("yut").hidden = true;
				document.getElementById("yutyut").hidden = false;
				
				//score배열에 'pink'가 3이상이면
				//게임을 끝내고 결과창으로 이동시킨다.
			}else if(blueCount >=3){
				alert(stuff[stuffIndex].color+" : "+(stuffIndex+1)+"번 말이 도착했습니다.");
				alert('blue말이 승리 하였습니다.\n 수집한 재료로 떡국 만들러 GoGo~!');
				document.getElementById("yut").hidden = true;
				document.getElementById("yutyut").hidden = false;
			}
			if(edge[stuffIndex] >= 20 && (pinkCount < 3 && blueCount <3)){
				alert(stuff[stuffIndex].color+" : "+(stuffIndex+1)+"번 말이 도착했습니다.\n얼마 안남았습니다. 화이팅~!");
				alert(stuff[stuffIndex].color+" : "+(stuffIndex+2)+"번 말 출발~!");
			}
			//다음 윷 말을 출발점으로 이동시킨다.
			(stuffIndex <=2) ? stuff[stuffIndex+1].x=495 : stuff[stuffIndex+1].x=520;
			stuff[stuffIndex+1].y=520;

			//도착한 말은 점수판 위치에 옮긴다.
			//pinkCount + blueCount는 몇번 움직여야 할지를 정한다.
			stuff[stuffIndex].x=595 + 23*(pinkCount + blueCount);
			stuff[stuffIndex].y=410;

		}

	}

	console.log("msg1["+stuffIndex+"] : "+msg1[stuffIndex]+"\nmsg2["+stuffIndex+"] : "+msg2[stuffIndex]+"\nmsg3["+stuffIndex+"] : "+msg3[stuffIndex]);
	drawStuff();
} 

//----------------------------------------------------------------------------------------------------------

function edgeDiagonalCounter(){
	//이동 해야 할 거리 수치 변수
	var parameter = 0;

	//yutThrow()함수에 의해  저장된 throwResult값을 조건식으로 사용
	//throwResult값은 도 개 걸 윷 모 중 하나
	switch (throwResult) {
	case '도':
		//firstEdge[stuffIndex] : 첫 모서리가 출발점인 이동 거리 스택
		//이동스택 1증가
		if(msg1[stuffIndex]!=0)
			firstEdge[stuffIndex] += 1;
		if(msg2[stuffIndex]!=0)
			secondEdge[stuffIndex] += 1;
		//이동 해야 할 수치
		parameter = 1;
		break;
	case '개':
		//이동스택 2증가
		if(msg1[stuffIndex]!=0)
			firstEdge[stuffIndex] += 2;
		if(msg2[stuffIndex]!=0)
			secondEdge[stuffIndex] += 2;
		//이동 해야 할 수치
		parameter = 2;
		break;
	case '걸':
		//이동스택 3증가
		if(msg1[stuffIndex]!=0)
			firstEdge[stuffIndex] += 3;
		if(msg2[stuffIndex]!=0)
			secondEdge[stuffIndex] += 3;
		//이동 해야 할 수치
		parameter = 3;
		break;
	case '윷':
		//이동스택 4증가
		if(msg1[stuffIndex]!=0)
			firstEdge[stuffIndex] += 4;
		if(msg2[stuffIndex]!=0)
			secondEdge[stuffIndex] += 4;
		//이동 해야 할 수치
		parameter = 4;
		break;
	case '모':
		//이동스택 5증가
		if(msg1[stuffIndex]!=0)
			firstEdge[stuffIndex] += 5;
		if(msg2[stuffIndex]!=0)
			secondEdge[stuffIndex] += 5;
		//이동 해야 할 수치
		parameter = 5;
		break;
	default:
		break;
	}	

	//이동 해야 할 거리 수치
	//세번째 모서리 부분에서 꺾여야 한다. 꺾이는 부분이 firstEdge[stuffIndex] == 11 이므로
	//11을 나눈 나머지로 이동 해야 할 거리 수치를 구한다.
	//ex)firstEdge[stuffIndex] == 13이면 두가지로 판단 할 수 있다.
	//1.꺾이는 위치 11에서 개가 나와 오른쪽 방향 x축으로 2 이동 하는 경우
	//2.꺾이는 위치가 아닌 곳에서 걸이 나와 2 이동 해야 하는 경우
	//13 = 8+5=9+4=10+3=11+2 -->경우의 수 2번인 경우다.
	//꺾이는 위치를 기준으로 이동해야 하므로 꺾이는 위치가 11이다. 순서까지 고려하여 6을 자연수 2가지 수로  분할 할 수 있는 경우의 수는 4가지인데 8,9,10에서는 오른쪽 방향 x축으로 이동 할 수 없으므로
	//x축으로 이동해야 할 수치만 구해서 파라미터값을 yutCooredinate(parameter)함수로 보내주기만 하면 된다. 따라서  우리는 몫을 11로 나눈 나머지만 구하면 된다.
	if(firstEdge[stuffIndex] >= 11 && msg1[stuffIndex]!=0 && msg3[stuffIndex]==0){
		parameter = firstEdge[stuffIndex] % 11;
		console.log("firstEdge["+stuffIndex+"] % 11 : "+parameter);//
	}
	//by 우영, 윷의 대각선 경로(지름길)위치함수
	//이동해야 할 거리 수치 변수 값을 파라미터값으로 넘겨준다. 
	//일직선 경로 인 경우 이동수치 그대로 파라미터값을 보내주면 됩니다.
	yutDiagonalCoordinate(parameter);
}

//----------------------------------------------------------------------------------------------------------

//by 우영, 기능 : 대각선 경로(지름길) 윷의 위치 함수
//첫번째 모서리에서는 edge[stuffIndex]값을 firstEdge[stuffIndex]변수에 저장하고 두번쨰 모서리에서는 secondEdge[stuffIndex]변수에 저장한다.
//말이 이동해야할 거리값을 파라미터 값으로 받고 x,y축 좌표값을 찍어주는 함수
//firstEdge[stuffIndex] 값에 따라 위치가 변하도록 알고리즘 구성
function yutDiagonalCoordinate(parameter){
	//5<=firstEdge[stuffIndex]<8 or 8<firstEdge[stuffIndex]<11
	if((firstEdge[stuffIndex] >= 5 && firstEdge[stuffIndex] < 8) || (firstEdge[stuffIndex] > 8 && firstEdge[stuffIndex] < 11)){	
		
		//8<firstEdge[stuffIndex]<11일때
		//일직선으로 쭉 가는경우 그렇지 않은 경우로 나눌 수 있다.
		//지름길 선택시 msg3[stuffIndex]값이 true로 저장되고 중앙 모서리에서 꺾이므로
		//x 좌표 y좌표 각각 77씩 (parameter-1)번 움직인다
		if(msg3[stuffIndex] !=0){ 
			for(var j = 0; j < parameter; j++){
				stuff[stuffIndex].x+= 77;
				stuff[stuffIndex].y+= 77; 
				console.log("x좌표 위치 : "+stuff[stuffIndex].x+", y좌표 위치 : "+stuff[stuffIndex].y);
			}
		}else{
			for(var j = 0; j < parameter; j++){
				stuff[stuffIndex].x-=77;
				stuff[stuffIndex].y+=77;
				console.log("x좌표 위치 : "+stuff[stuffIndex].x+", y좌표 위치 : "+stuff[stuffIndex].y);
			}
		}

		//firstEdge[stuffIndex] == 8인 경우 윷놀이판 중앙모서리 이므로
		//만약 핑크말이 firstEdge[stuffIndex] == 8 이고 블루말이 secondEdge[stuffIndex]==13이면 둘이 만나므로
		//horseCatch함수가 작동하여 핑크말 턴에서 8이나왔다면 블루말이 잡혀 출발점으로 가야하므로
		//x좌표 y좌표 값이 같아야 한다.(위치가 같아야 한다.) 따라서 13일때 x좌표 275 y좌표 290으로 위치 시킨다.	
	}else if(firstEdge[stuffIndex] == 8){
		var conMessage = 0;
		stuff[stuffIndex].x = 275;
		stuff[stuffIndex].y = 290;
		//중앙모서리에서 지름길 동의시 msg3[stuffIndex]가 true로 저장
		conMessage = confirm("선택의 순간! 지름길로 가시겠습니까?"); 
		if(conMessage == true){
			msg3[stuffIndex] = conMessage;
		}
		//11=<firstEdge[stuffIndex]<20인 경우 지름길에서 벗어난 경우이므로 
		//세번째 모서리에 위치 시킨 후 11로 나눈 나머지가 parameter 값으로 왔으므로
		//만약 firstEdge[stuffIndex] == 10 에서 걸이 나왔다면 3칸 움직여야 하므로 꺾이는 위치인 11을 기준으로 x축 오른쪽방향2칸 이므로 11 + 2
		//13 % 11 == 2
	}else if(firstEdge[stuffIndex] >= 11 && firstEdge[stuffIndex] < 20){
		stuff[stuffIndex].x = 50;
		stuff[stuffIndex].y = 530;

		//parmeter번 x축 오른쪽방향으로 90이동
		for(var j = 0; j < parameter; j++){
			stuff[stuffIndex].x += 90;
		}

		//11<=firstEdge[stuffIndex]<20이면서
		//중앙 모서리 부분에서 지름길에 동의한 경우에 결승점 도착이므로
		//score[stuffIndex]에 도착한 말의 색을 저장
		//score 배열에서 'pink' or 'blue'를 요소값으로 갖는 요소들이 3개면 게임 종료
		if(msg3[stuffIndex]!=0){
			//ex)score[0] = 'pink' or score[3] = 'blue'
			score[stuffIndex] = stuff[stuffIndex].color;
			//도착한 pink말 blue말이 몇개인지 계산
			//'pink' 와 'blue'갯수 구하기
			//filter함수로 구한 특정 요소 값을 새로운 배열로 생성. 요솟수가 곧 구하고자하는 요소값 갯수
			var pinkCount = score.filter(element => 'pink' === element).length;//'pink'로 저장된 요소값 갯수
			var blueCount = score.filter(element => 'blue' === element).length;//'blue'로 저장된 요소값 갯수

			//score배열에 'pink'가 3이상이면
			//게임을 끝내고 결과창으로 이동시킨다.
			if(pinkCount >=3){
				alert(stuff[stuffIndex].color+" : "+(stuffIndex+1)+"번 말이 도착했습니다.");
				alert('pink말이 승리 하였습니다.\n 수집한 재료로 떡국 만들러 GoGo~!');
				document.getElementById("yut").hidden = true;
				document.getElementById("yutyut").hidden = false;

				//score배열에 'blue'가 3이상이면
				//게임을 끝내고 결과창으로 이동시킨다.
			}else if(blueCount >=3){
				alert(stuff[stuffIndex].color+" : "+(stuffIndex+1)+"번 말이 도착했습니다.");
				alert('blue말이 승리 하였습니다.\n 수집한 재료로 떡국 만들러 GoGo~!');
				document.getElementById("yut").hidden = true;
				document.getElementById("yutyut").hidden = false;
			}
			//중앙모서리 동의 한 경우이며 score배열에 'pink'3미만 이고 'blue'3미만 이면	
			//아직 두 말 모두 3점을 딴것이 아니므로 다음말을 출발점으로 꺼내서 게임을 계속 진행 시킨다.
			if(msg3[stuffIndex]!=0 && (pinkCount < 3 && blueCount <3)){
				alert((stuffIndex+1)+"번 말이 도착했습니다.\n얼마 안남았습니다. 화이팅~!");
				alert(stuff[stuffIndex].color+" : "+(stuffIndex+2)+"번 말 출발~!");
			}
			//다음 말을 출발점으로 이동시키고 핑크면 x좌표 495 블루면 520
			(stuffIndex <=2) ? stuff[stuffIndex+1].x=495 : stuff[stuffIndex+1].x=520;
			stuff[stuffIndex+1].y=520;

			//도착한 말은 이 좌표에 위치 시킨다.
			stuff[stuffIndex].x=595 + 23*(pinkCount + blueCount);
			stuff[stuffIndex].y=410;
		}//if(msg3[stuffIndex]!=0)

		//대각선 경로에서 탈출한 순간 지름길 여부를 false로 저장하고
		//edge[stuffIndex]를 계산하여 yutCoordinate함수가 실행 되도록 한다.
		msg1[stuffIndex] = 0;
		edge[stuffIndex] += (firstEdge[stuffIndex] - 1); 

		//secondEdge[stuffIndex] : 시작점이 두번째 모서리인 이동거리 스택
		//두번째 모서리에서 지름길 동의시 edge[stuffIndex]값이 secondEdge[stuffIndex]에 저장되므로 second[stuffIndex]값은 10 + 알파
		//조건식을 secondEdge[stuffIndex] >= 16으로 할 시 코드끼리 충돌이 생겨 세부적으로 구간을 나누었습니다.
		//10<=secondEdge[stuffIndex]<13 or 13<secondEdge[stuffIndex]<16
	}else if((secondEdge[stuffIndex] >=10 && secondEdge[stuffIndex] < 13) || secondEdge[stuffIndex] > 13 && secondEdge[stuffIndex] < 16){
		//11,12 or 14,15 for문으로 각각 x좌표 y좌표 77씩 parameter번 이동하도록 한다.
		for(var j = 0; j < parameter; j++){
			stuff[stuffIndex].x+=77;
			stuff[stuffIndex].y+=77;
			console.log("x좌표 위치 : "+stuff[stuffIndex].x+", y좌표 위치 : "+stuff[stuffIndex].y);
		}
		//secondEdge[stuffIndex] == 13인 경우 윷놀이판 중앙모서리 이므로
		//만약 핑크말이 firstEdge[stuffIndex] == 8 이고 블루말이 secondEdge[stuffIndex]==13이면 둘이 만나므로
		//horseCatch함수가 작동하여 핑크말 턴에서 8이나왔다면 블루말이 잡혀 출발점으로 가야하므로
		//x좌표 y좌표 값이 같아야 한다.(위치가 같아야 한다.) 따라서 13일때 x좌표 275 y좌표 290으로 위치 시킨다.		
	}else if(secondEdge[stuffIndex] == 13){
		stuff[stuffIndex].x = 275;
		stuff[stuffIndex].y = 290;

		//secondEdge[stuffIndex] >=16인 경우 결승점 도착 이므로
		//score[stuffIndex]에 도착한 말의 색을 저장
		//score 배열에서 'pink' or 'blue'를 요소값으로 갖는 요소들이 3개면 게임 종료
	}else if(secondEdge[stuffIndex] >=16){
		//ex)score[0] = 'pink' or score[3] = 'blue'
		score[stuffIndex] = stuff[stuffIndex].color;
		//도착한 pink말 blue말이 몇개인지 계산
		//'pink' 와 'blue'갯수 구하기
		//filter함수로 구한 특정 요소 값을 새로운 배열로 생성. 요솟수가 곧 구하고자하는 요소값 갯수
		var pinkCount = score.filter(element => 'pink' === element).length;//'pink'로 저장된 요소값 갯수
		var blueCount = score.filter(element => 'blue' === element).length;//'blue'로 저장된 요소값 갯수
		//score배열에 'pink'가 3이상이면
		//게임을 끝내고 결과창으로 이동시킨다.
		if(pinkCount >=3){
			alert(stuff[stuffIndex].color+" : "+(stuffIndex+1)+"번 말이 도착했습니다.");
			alert('pink말이 승리 하였습니다.\n 수집한 재료로 떡국 만들러 GoGo~!');
			document.getElementById("yut").hidden = true;
			document.getElementById("yutyut").hidden = false;
			//score배열에 'blue'가 3이상이면
			//게임을 끝내고 결과창으로 이동시킨다.
		}else if(blueCount >=3){
			alert(stuff[stuffIndex].color+" : "+(stuffIndex+1)+"번 말이 도착했습니다.");
			alert('blue말이 승리 하였습니다.\n 수집한 재료로 떡국 만들러 GoGo~!');
			document.getElementById("yut").hidden = true;
			document.getElementById("yutyut").hidden = false;
		}
		//secondEdge[stuffIndex] 이동스택이 16이상 이고 'pink'요소값 갯수가 3미만 그리고 'blue'갯수가 3미만
		if(secondEdge[stuffIndex] >=16 && (pinkCount < 3 && blueCount <3)){
			alert(stuff[stuffIndex].color+" : "+(stuffIndex+1)+"번 말이 도착했습니다.\n얼마 안남았습니다. 화이팅~!");
			alert(stuff[stuffIndex].color+" : "+(stuffIndex+2)+"번 말 출발~!");		
		}
		//다음 윷 말을 출발점으로 이동시킨다.
		(stuffIndex <=2) ? stuff[stuffIndex+1].x=495 : stuff[stuffIndex+1].x=520;
		stuff[stuffIndex+1].y=520;

		//도착한 말은 점수판 위치에 옮긴다.
		//pinkCount + blueCount는 몇번 움직여야 할지를 정한다.
		stuff[stuffIndex].x=595 + 23*(pinkCount + blueCount);
		stuff[stuffIndex].y=410;
	}
}






//-----------------------------------------------------------------------------------

//by 우영,기능 : 게임 내 수집한 재료 이미지를 출력
//반복문 for문을 사용하여 cookStuff 배열에 저장된 요소들은 하나씩 출력
function tteoggug(){
	var gug=document.getElementById('gug');

	gug.innerHTML += "<img style='z-index:100' width='70px' src = '" + cookf[j] + "'>";
	console.log("tteoggug: " + cook[j]);


}

//------------------------------------------------------------------------------------

//by우영, 기능 : 윷놀이 말을 찍어내는 함수
//파라미터값으로 x,y좌표값 사각형 가로, 높이, 색을 받는다.
function Rect(x, y, width, height, color) { 
	this.x = x;
	this.y = y;
	this.width = width;
	this.height = height;
	this.color = color;

	this.draw = function drawRect() {
		ctx.fillStyle = this.color; 
		ctx.fillRect(this.x, this.y, this.width, this.height); 
	}
}

//by우영, 기능 : 윷놀이 판 뒷배경 찍어내는 함수
function drawStuff() {
	ctx.clearRect(0,0,800,600); 
	ctx.strokeStyle = "white";  
	ctx.lineWidth = "1px";
	ctx.strokeRect(0,0,800,600);
	for(var k = 0; k<stuff.length; k++) {
		stuff[k].draw(); 
	}
}
