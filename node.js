class Dial {
  constructor(container) {
    this.container = container;
    this.size = this.container.dataset.size;
    this.strokeWidth = this.size / 8;
    this.radius = this.size / 2 - this.strokeWidth / 2;
    this.value = this.container.dataset.value;
    this.direction = this.container.dataset.arrow;
    this.svg;
    this.defs;
    this.slice;
    this.overlay;
    this.text;
    this.arrow;
    this.create();
  }

  create() {
    this.createSvg();
    this.createDefs();
    this.createSlice();
    this.createOverlay();
    this.createText();
    this.createArrow();
    this.container.appendChild(this.svg);
  }

  createSvg() {
    let svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("width", `${this.size}px`);
    svg.setAttribute("height", `${this.size}px`);
    this.svg = svg;
  }

  createDefs() {
    var defs = document.createElementNS("http://www.w3.org/2000/svg", "defs"),
      linearGradient = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "linearGradient"
      ),
      stop1 = document.createElementNS("http://www.w3.org/2000/svg", "stop"),
      stop2 = document.createElementNS("http://www.w3.org/2000/svg", "stop"),
      linearGradientBackground = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "background"
      );
    linearGradient.setAttribute("id", "gradient");
    stop1.setAttribute("stop-color", "#ffa000");
    stop1.setAttribute("offset", "0%");
    linearGradient.appendChild(stop1);
    stop2.setAttribute("stop-color", "#f25767");
    stop2.setAttribute("offset", "100%");
    linearGradient.appendChild(stop2);
    linearGradientBackground.setAttribute("id", "gradient-background");
    var stop1 = document.createElementNS("http://www.w3.org/2000/svg", "stop");
    stop1.setAttribute("stop-color", "rgba(0,0,0,0.2)");
    stop1.setAttribute("offset", "0%");
    linearGradientBackground.appendChild(stop1);
    var stop2 = document.createElementNS("http://www.w3.org/2000/svg", "stop");
    stop2.setAttribute("stop-color", "rgba(0,0,0,0.5)");
    stop2.setAttribute("offset", "1000%");
    linearGradientBackground.appendChild(stop2);
    defs.appendChild(linearGradient);
    defs.appendChild(linearGradientBackground);
    this.svg.appendChild(defs);
    this.defs = defs;
  }

  createSlice() {
    let slice = document.createElementNS("http://www.w3.org/2000/svg", "path");
    slice.setAttribute("fill", "none");
    slice.setAttribute("stroke", "url(#gradient)");
    slice.setAttribute("stroke-width", this.strokeWidth);
    slice.setAttribute(
      "transform",
      `translate(${this.strokeWidth / 2},${this.strokeWidth / 2})`
    );
    slice.setAttribute("class", "animate-draw");
    this.svg.appendChild(slice);
    this.slice = slice;
  }

  createOverlay() {
    const r = this.size - this.size / 2 - this.strokeWidth / 2;
    const circle = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "circle"
    );
    circle.setAttribute("cx", this.size / 2);
    circle.setAttribute("cy", this.size / 2);
    circle.setAttribute("r", r);
    circle.setAttribute("fill", "url(#gradient-background)");
    circle.setAttribute("class", "animate-draw");
    this.svg.appendChild(circle);
    this.overlay = circle;
  }

  createText() {
    const fontSize = this.size / 3.5;
    let text = document.createElementNS("http://www.w3.org/2000/svg", "text");
    text.setAttribute("x", this.size / 2 + fontSize / 7.5);
    text.setAttribute("y", this.size / 2 + fontSize / 4);
    text.setAttribute("font-family", "Century Gothic Lato");
    text.setAttribute("font-size", fontSize);
    text.setAttribute("fill", "#78f8ec");
    text.setAttribute("text-anchor", "middle");
    const tspanSize = fontSize / 3;
    text.innerHTML = `${0}% `;
    this.svg.appendChild(text);
    this.text = text;
  }

  createArrow() {
    var arrowSize = this.size / 10;
    var mapDir = {
      up: [(arrowYOffset = arrowSize / 2), (m = -1)],
      down: [(arrowYOffset = 0), (m = 1)]
    };
    function getDirection(i) {
      return mapDir[i];
    }
    var [arrowYOffset, m] = getDirection(this.direction);

    let arrowPosX = this.size / 2 - arrowSize / 2,
      arrowPosY = this.size - this.size / 3 + arrowYOffset,
      arrowDOffset = m * (arrowSize / 1.5),
      arrow = document.createElementNS("http://www.w3.org/2000/svg", "path");
    arrow.setAttribute(
      "d",
      `M 0 0 ${arrowSize} 0 ${arrowSize / 2} ${arrowDOffset} 0 0 Z`
    );
    arrow.setAttribute("fill", "none");
    arrow.setAttribute("opacity", "0.6");
    arrow.setAttribute("transform", `translate(${arrowPosX},${arrowPosY})`);
    this.svg.appendChild(arrow);
    this.arrow = arrow;
  }

  animateStart() {
    let v = 0;
    const intervalOne = setInterval(() => {
      const p = +(v / this.value).toFixed(2);
      const a = p < 0.95 ? 2 - 2 * p : 0.05;
      v += a;
      if (v >= +this.value) {
        v = this.value;
        clearInterval(intervalOne);
      }
      this.setValue(v);
    }, 10);
  }

  polarToCartesian(centerX, centerY, radius, angleInDegrees) {
    const angleInRadians = ((angleInDegrees - 180) * Math.PI) / 180.0;
    return {
      x: centerX + radius * Math.cos(angleInRadians),
      y: centerY + radius * Math.sin(angleInRadians)
    };
  }

  describeArc(x, y, radius, startAngle, endAngle) {
    const start = this.polarToCartesian(x, y, radius, endAngle);
    const end = this.polarToCartesian(x, y, radius, startAngle);
    const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
    const d = [
      "M",
      start.x,
      start.y,
      "A",
      radius,
      radius,
      0,
      largeArcFlag,
      0,
      end.x,
      end.y
    ].join(" ");
    return d;
  }

  setValue(value) {
    let c = (value / 100) * 360;
    if (c === 360) c = 359.99;
    const xy = this.size / 2 - this.strokeWidth / 2;
    const d = this.describeArc(xy, xy, xy, 180, 180 + c);
    this.slice.setAttribute("d", d);
    const tspanSize = this.size / 3.5 / 3;
    this.text.innerHTML = `${Math.floor(value)}% `;
  }

  animateReset() {
    this.setValue(0);
  }
}

const containers = document.getElementsByClassName("chart");
const dial = new Dial(containers[0]);
dial.animateStart();
