import type { number } from 'astro/zod'
import { createCanvas, type CanvasRenderingContext2D, type Canvas } from 'canvas'


class Plotter {
  constructor(width: number, height: number, x_min: number, x_max: number, y_min: number, y_max: number, steps: number = 50) {
    this.width = width
    this.height = height
    this.x_max = x_max
    this.x_min = x_min
    this.y_max = y_max
    this.y_min = y_min
    this.canvas = createCanvas(width, height, "svg")
    this.context = this.canvas.getContext("2d")
    this.steps_per_unit = 50

  }


  private width: number = 0
  private height: number = 0
  private x_min: number = 0
  private x_max: number = 0
  private y_min: number = 0
  private y_max: number = 0
  private canvas: Canvas
  private context: CanvasRenderingContext2D

  private steps_per_unit: number = 30
  initialize() {

  }


  get_buffer() {
    return this.canvas.toBuffer()
  }

  map_to_canvas_x(x_val: number) {
    const diff = this.x_max - this.x_min
    return (this.width / diff) * (x_val - this.x_min) - this.width / 2
  }

  map_to_canvas_y(y_val: number) {
    const diff = this.y_max - this.y_min
    return (this.height / diff) * (y_val - this.y_min) - this.height / 2
  }

  plot_axis(line_width: number = 2, color: string = "black") {
    const h = this.canvas.height
    const w = this.canvas.width
    const cw = w / 2
    const ch = h / 2
    const diff = this.x_max - this.x_min
    const diffy = this.y_max - this.y_min
    const unit_width_y = h / diffy
    const unit_width = w / diff

    this.context.beginPath()
    this.context.lineWidth = line_width / 2
    this.context.strokeStyle = "lightgray"

    for (let i = this.x_min + 1; i < this.x_max; ++i) {
      this.context.moveTo(i * unit_width, -ch)
      this.context.lineTo(i * unit_width, ch)
    }

    for (let i = this.y_min + 1; i < this.y_max; ++i) {
      this.context.moveTo(cw, i * unit_width_y)
      this.context.lineTo(-cw, i * unit_width_y)
    }
    this.context.stroke()
    this.context.closePath()

    this.context.beginPath()
    this.context.lineWidth = line_width
    this.context.strokeStyle = color
    this.context.moveTo(-cw, 0)
    this.context.lineTo(cw, 0)

    this.context.moveTo(0, -ch)
    this.context.lineTo(0, ch)
    this.context.stroke()
    this.context.closePath()

  }

  plot_xyvalues() {
    const w = this.canvas.width
    const h = this.canvas.height
    const diff = this.x_max - this.x_min
    const diffy = this.y_max - this.y_min
    const unit_width_y = h / diffy
    const unit_width = w / diff

    this.context.textDrawingMode = "path"
    this.context.font = "bold 18px consolas"
    this.context.fillStyle = "gray"

    //this.context.rotate(Math.PI)
    this.context.setTransform(1, 0, 0, 1, w / 2, h / 2)
    for (let indx = Math.floor(this.x_min + 1); indx < 0; ++indx) {
      let map = this.map_to_canvas_x(indx)
      this.context.lineWidth = 1.5
      this.context.moveTo(map, 0)
      this.context.lineTo(map, 3)
      this.context.fillText(`${indx}`, map - unit_width * 0.5, 25)
    }

    for (let indx = 1; indx < Math.floor(this.x_max); ++indx) {
      let map = this.map_to_canvas_x(indx)
      this.context.lineWidth = 1.5
      this.context.moveTo(map, 0)
      this.context.lineTo(map, 3)
      this.context.fillText(`${indx}`, map - unit_width * 0.15, 25)
    }

    for (let indx = 1; indx < Math.floor(this.x_max); ++indx) {
      let map = this.map_to_canvas_x(indx)
      this.context.lineWidth = 1.5
      this.context.moveTo(map, 0)
      this.context.lineTo(map, 3)
      this.context.fillText(`${indx}`, map - unit_width * 0.15, 25)
    }

    for (let indx = Math.floor(this.y_min + 1); indx < 0; ++indx) {
      let map = this.map_to_canvas_y(indx)
      this.context.lineWidth = 1.5
      this.context.moveTo(0, -map)
      this.context.lineTo(-3, -map)
      this.context.fillText(`${indx}`, -28, -map + unit_width_y * 0.15)
    }

    for (let indx = 1; indx < Math.floor(this.y_max); ++indx) {
      let map = this.map_to_canvas_y(indx)
      this.context.lineWidth = 1.5
      this.context.moveTo(-3, -map)
      this.context.lineTo(0, -map)
      this.context.fillText(`${indx}`, -20, -map + unit_width_y * 0.15)
    }



    this.context.stroke()
  }

  plot(func: Function, domain: [number, number], color: string, line_width: number = 5, steps_per_unit: number | null = null) {

    const h = this.canvas.height
    const w = this.canvas.width
    const cw = w / 2
    const ch = h / 2

    const diff_y = this.y_max - this.y_min
    const diff_x = this.x_max - this.x_min

    const incr = steps_per_unit == null ? 1 / this.steps_per_unit : 1 / steps_per_unit

    const unit_width = w / diff_x
    const unit_height = h / diff_y

    const top = ch
    const bottom = -ch
    const left = -cw
    const right = cw

    const step_x_size = steps_per_unit == null ? unit_width / this.steps_per_unit : unit_width / steps_per_unit
    this.context.beginPath()
    this.context.setTransform(1, 0, 0, -1, cw, ch)

    const [domain_start, domain_end] = domain;

    this.context.strokeStyle = color
    this.context.lineWidth = line_width

    let y: number = this.map_to_canvas_y(func(domain_start))
    let y_prev: number = y

    let pos_x = this.map_to_canvas_x(domain_start)


    this.context.moveTo(pos_x, y)
    for (let x = domain_start; x <= domain_end; x += incr) {
      y = this.map_to_canvas_y(func(x))

      if (Math.abs(y - y_prev) > unit_height * 1 / 3) //threshold for discontinuity
      {
        this.context.moveTo(pos_x + 0.7, y)
        this.context.arc(pos_x - 0.5, y, 3.5, 0, 2 * Math.PI);
      }
      if (y > top || y < bottom) {
        // Point is outside the view; move to the new position
        this.context.moveTo(pos_x + step_x_size, y);
      } else {
        this.context.lineTo(pos_x + step_x_size, y);
      }

      pos_x += step_x_size
      y_prev = y
    }

    this.context.stroke()
    this.context.closePath()
  }
}







const possibly_colors = ["#e23275",
  "#40c661",
  "#1e166b",
  "#c7df52",
  "#5f0063",
  "#5e8400",
  "#ff8ef6",
  "#6d3800",
  "#b5a6ff",
  "#ad1e15",
  "#0181ca",
  "#ff9c64",
  "#6c163b",
  "#fca0cb",
  "#7d0033"]

function shuffleArray(array: Array<string>) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

function disco(x: number) {
  return x > 1 ? 1 : 3
}


//No problem in a,va, b left dif right, c left dif right
//a b c
// diff va,vb,vc 1
function discontinuity_gen(x: number, a: number, b: number, c: number, va: number, vb: number, vc: number) {
  if (x >= -6 && x < a) {
    return va+2*Math.sin(Math.PI*x*2)
  }
  else if (x >= a && x < b) {
    return (va - vb) / (b - a) * (x - b) + vb
  } else if (x >= b && x < c) {
    return -(x - va)*(x-va) + vc
  }
  else {
    return -(va - vc) / (a - c) * (x - c) + vc
  }
}

export async function GET({ request }) {

  const url = new URL(request.url)
  const parameters = new URLSearchParams(url.search)

  let a = parseInt(parameters.get("a") ?? "-2")
  let b = parseInt(parameters.get("b") ?? "0")
  let c = parseInt(parameters.get("c") ?? "2")
  let va = parseInt(parameters.get("va") ?? "3")
  let vb = parseInt(parameters.get("vb") ?? "-2")
  let vc = parseInt(parameters.get("vc") ?? "4")






  shuffleArray(possibly_colors)
  const color = possibly_colors[0]

  let draw = new Plotter(512, 512, -7, 7, -7, 7, 20)

  draw.plot((x: number) => discontinuity_gen(x, a, b, c, va, vb, vc), [-6, 6], color, 2)
  draw.plot_axis()
  draw.plot_xyvalues()


  return new Response(draw.get_buffer())

}
