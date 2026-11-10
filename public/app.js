const lessons = {
 math: {
  "Ratios and percentages": [
   ["A bike costs $80. It's 25% off. What is the sale price in dollars?",60,"Find 25% of 80 first. 25% is one fourth.","One fourth of 80 is 20. Subtract the discount: 80 − 20 = 60."],
   ["A recipe uses 3 cups of flour for 8 muffins. How many cups for 24 muffins?",9,"How many times larger is 24 than 8?","24 ÷ 8 = 3, so multiply the flour by 3: 3 × 3 = 9 cups."],
   ["You got 18 questions right out of 20. What percentage is that?",90,"Divide 18 by 20, then multiply by 100.","18 ÷ 20 = 0.9, and 0.9 × 100 = 90%."]
  ],
  "Negative numbers": [
   ["The temperature is −4°C and drops 7°C. What is the new temperature?",-11,"A drop means moving left on the number line.","Start at −4 and subtract 7: −4 − 7 = −11°C."],
   ["What is −9 + 14?",5,"Use 9 of the 14 positive units to cancel the negative units.","−9 + 9 = 0. There are 5 positive units left."],
   ["What is −6 × −3?",18,"Two factors with the same sign have a positive product.","6 × 3 = 18. Both factors are negative, so the product is positive."]
  ],
  "Equations": [
   ["Solve for x: 3x + 5 = 20.",5,"Subtract 5 from both sides first.","3x = 15. Divide both sides by 3 to get x = 5."],
   ["Solve for x: 2(x − 3) = 14.",10,"Divide both sides by 2 first.","x − 3 = 7. Add 3 to both sides to get x = 10."],
   ["Solve for x: 4x − 7 = x + 8.",5,"Subtract x from both sides to put the x terms together.","3x − 7 = 8, then 3x = 15, so x = 5."]
  ],
  "Geometry": [
   ["A triangle has angles of 48° and 67°. How many degrees is the third angle?",65,"The three angles of a triangle add to 180°.","48 + 67 = 115. Then 180 − 115 = 65°."],
   ["A triangle has a base of 12 cm and a height of 5 cm. What is its area in square centimeters?",30,"A triangle has half the area of a parallelogram with the same base and height.","Multiply 12 × 5 = 60, then divide by 2 to get 30 cm²."],
   ["On a map, 1 cm represents 4 km. How many kilometers does 7.5 cm represent?",30,"Multiply the map distance by the number of kilometers per centimeter.","7.5 × 4 = 30 km."]
  ]
 },
 science: {
  "Ecosystems": [
   ["In a chain of grass → rabbit → fox, which organism is the producer?",["Grass","Rabbit","Fox"],0,"Think about which organism can make sugars using sunlight.","Grass makes sugars through photosynthesis, so it is the producer."],
   ["If the grass supply drops sharply, what will likely happen to the rabbits first?",["They gain a new food source","They have less food","They become producers"],1,"Follow the arrow from grass to rabbit.","The rabbits eat grass. Less grass means less available food for rabbits."],
   ["What role do decomposers play?",["Turn sunlight into food","Stop nutrients from cycling","Break down dead material"],2,"Think about what fungi do on a fallen log.","Decomposers break down dead material and return nutrients to the ecosystem."]
  ],
  "Matter and energy": [
   ["Which change creates a new substance?",["Ice melting","Iron rusting","Water boiling"],1,"Think about which result has a different chemical composition.","Iron reacts with oxygen in the presence of water to form rust. Melting and boiling change state."],
   ["Why does a metal spoon heat up when it sits in hot soup?",["Conduction","Photosynthesis","Evaporation"],0,"Energy moves between things that touch.","Thermal energy transfers by conduction from the soup to the spoon and along the metal."],
   ["What happens to water molecules as liquid water boils?",["They stop moving","They turn into oxygen","They move farther apart in the gas"],2,"Water vapor is still made of water molecules.","Water molecules spread farther apart as they enter the gas phase. Each molecule remains H₂O."]
  ],
  "Forces and motion": [
   ["Two students push a box in opposite directions with equal force. What is the net force from their pushes?",["Zero","Twice one push","Toward the taller student"],0,"Opposite directions have opposite signs.","Equal pushes in opposite directions cancel, giving zero net force from the pushes."],
   ["What force slows a book sliding across a table?",["Magnetism","Friction","Gravity alone"],1,"Look at the two surfaces rubbing against each other.","Friction between the book and the table acts opposite the book’s sliding motion."],
   ["Two carts receive the same net force. Which accelerates more?",["The cart with greater mass","Both accelerate equally","The cart with less mass"],2,"Acceleration is net force divided by mass.","The same force divided by a smaller mass gives a larger acceleration."]
  ]
 }
};
const byId = id => document.getElementById(id);
const topic = byId("topic");
let subject, index, solved, resolved;
const current = () => lessons[subject][topic.value][index];
function show(id, message) {
 const element = byId(id);
 element.textContent = message;
 element.hidden = !message;
}
function selectSubject(value) {
 subject = value;
 document.querySelectorAll("nav button").forEach(button => {
  button.setAttribute("aria-pressed", button.dataset.subject === value);
 });
 topic.replaceChildren(...Object.keys(lessons[value]).map(name => new Option(name)));
 start();
}
function start() {
 index = 0;
 solved = 0;
 render();
}
function render(focus = false) {
 resolved = false;
 byId("practice").hidden = false;
 byId("summary").hidden = true;
 byId("progress").textContent = 'Question ' + (index + 1) + ' of ' + lessons[subject][topic.value].length;
 byId("question").textContent = current()[0];
 const response = byId("response");
 response.replaceChildren();
 if (subject === "math") {
  const input = document.createElement("input");
  input.id = "number";
  input.inputMode = "text";
  input.placeholder = "Enter a number";
  input.setAttribute("aria-label", "Your numerical answer");
  response.append(input);
 } else {
  current()[1].forEach((choice, i) => {
   const label = document.createElement("label");
   label.className = "answer";
   const radio = document.createElement("input");
   radio.type = "radio";
   radio.name = "choice";
   radio.value = i;
   label.append(radio, " " + choice);
   response.append(label);
  });
 }
 show("feedback", "");
 show("help", "");
 byId("next").hidden = true;
 byId("check").disabled = false;
 byId("hint").disabled = false;
 byId("explain").disabled = false;
 if (focus) byId("question").focus();
}
function finishQuestion(correct) {
 resolved = true;
 if (correct) solved++;
 byId("check").disabled = true;
 byId("hint").disabled = true;
 byId("explain").disabled = true;
 byId("response").querySelectorAll("input").forEach(input => input.disabled = true);
 byId("next").hidden = false;
 byId("next").textContent = index + 1 === lessons[subject][topic.value].length ? "See session recap →" : "Next question →";
 show("help", current().at(-1));
}
byId("form").onsubmit = event => {
 event.preventDefault();
 if (resolved) return;
 const answer = subject === "math" ? byId("number").value.trim().replace(/^−/, "-").replace(/%$/, "").trim() : document.querySelector("input[name=choice]:checked")?.value;
 if (!answer || !/^-?(?:\d+(?:\.\d*)?|\.\d+)$/.test(answer)) {
  show("feedback", subject === "math" ? "Enter a number to check your answer." : "Pick an answer to check it.");
  return;
 }
 if (Number(answer) === current()[subject === "math" ? 1 : 2]) {
  show("feedback", "You got it!");
  finishQuestion(true);
 } else {
  show("feedback", "Give it another try. Here’s a hint to get you started.");
  show("help", current().at(-2));
 }
};
byId("hint").onclick = () => show("help", current().at(-2));
byId("explain").onclick = () => {
 show("feedback", "Read through the explanation, then move to the next question.");
 finishQuestion(false);
};
byId("next").onclick = () => {
 index++;
 const count = lessons[subject][topic.value].length;
 if (index < count) return render(true);
 byId("practice").hidden = true;
 byId("summary").hidden = false;
 byId("progress").textContent = "Session recap";
 byId("score").textContent = 'You solved ' + solved + ' of ' + count + ' questions before opening the full explanation.';
 byId("review").textContent = solved < count ? 'Try ' + topic.value.toLowerCase() + ' again and see if you can explain each answer in your own words.' : "Try another topic or explain one answer in your own words.";
 byId("done").focus();
};
byId("restart").onclick = () => { start(); byId("question").focus(); };
topic.onchange = start;
document.querySelectorAll("nav button").forEach(button => button.onclick = () => {
 if (subject !== button.dataset.subject) selectSubject(button.dataset.subject);
});
selectSubject("math");
