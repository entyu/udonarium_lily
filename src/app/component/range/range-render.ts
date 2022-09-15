import { GridType } from '@udonarium/game-table';

type StrokeGridFunc = (w: number, h: number, gridSize: number) => GridPosition;
type GridPosition = { gx: number, gy: number };

export interface RangeRenderSetting {
  areaWidth: number;
  areaHeight: number;
  range: number;
  width: number;
  centerX: number;
  centerY: number;
  gridSize: number;
  type: string;
  gridColor: string;
  rangeColor: string;
  fanDegree: number;
  degree: number;
}

export class RangeRender {
  constructor(
    readonly canvasElement: HTMLCanvasElement,
    readonly canvasElementRange: HTMLCanvasElement,
  ) { }

  private makeBrush(context: CanvasRenderingContext2D, gridSize: number, gridColor: string): CanvasRenderingContext2D {
    // 座標描画用brush設定
    context.strokeStyle = gridColor;
    context.fillStyle = context.strokeStyle;
    context.lineWidth = 1;

    let fontSize: number = Math.floor(gridSize / 5);
    context.font = `bold ${fontSize}px sans-serif`;
    context.textBaseline = 'top';
    context.textAlign = 'center';
    return context
  }

/*
  renderCorn(width: number, height: number, gridSize: number = 50, gridType: GridType = GridType.SQUARE, gridColor: string = '#FF0000e6') {
    this.canvasElementRange.width = width * gridSize;
    this.canvasElementRange.height = height * gridSize;
    let context: CanvasRenderingContext2D = this.canvasElementRange.getContext('2d');
    let calcGridPosition: StrokeGridFunc = this.generateCalcGridPositionFunc(gridType);
    this.makeBrush(context, gridSize, gridColor);
    if (gridType < 0) return;

    context.beginPath();

    context.moveTo(0 , height * gridSize / 2);
    context.lineTo(width * gridSize, 0 * gridSize);
    context.stroke();

    context.moveTo(0 , height * gridSize / 2);
    context.lineTo(width * gridSize, height * gridSize);
    context.stroke();

    context.moveTo(width * gridSize , 0 * gridSize);
    context.lineTo(width * gridSize , height * gridSize);
    context.stroke();
    
  }
*/

  renderCorn(setting: RangeRenderSetting) {
    let gridSize = setting.gridSize;
    let offSetX_px = setting.areaWidth * gridSize / 2;
    let offSetY_px = setting.areaHeight * gridSize / 2;
    let rad = Math.PI / 180 * setting.degree;

    let gridOffX = - (setting.centerX % gridSize);
    let gridOffY = - (setting.centerY % gridSize);
    if(gridOffX > 0) gridOffX -= gridSize;
    if(gridOffY > 0) gridOffY -= gridSize;

    this.canvasElement.width = setting.areaWidth * gridSize;
    this.canvasElement.height = setting.areaHeight * gridSize;
    let context: CanvasRenderingContext2D = this.canvasElement.getContext('2d');
    
    let cx_ = 0.0;
    let cy_ = 0.0;
    let p1x_ = setting.range * gridSize;
    let p1y_ = -0.5 * setting.width * gridSize;
    let p2x_ = setting.range * gridSize;
    let p2y_ = 0.5 * setting.width * gridSize;

    let cx = cx_;
    let cy = cy_;
    let p1x = p1x_ * Math.cos(rad) - p1y_ * Math.sin(rad);
    let p1y = p1x_ * Math.sin(rad) + p1y_ * Math.cos(rad);
    let p2x = p2x_ * Math.cos(rad) - p2y_ * Math.sin(rad);
    let p2y = p2x_ * Math.sin(rad) + p2y_ * Math.cos(rad);

    let calcGridPosition: StrokeGridFunc = this.generateCalcGridPositionFunc(0);
    this.makeBrush(context, gridSize, setting.gridColor);
    for (let h = 0; h <= setting.areaHeight + 1 ; h++) {
      for (let w = 0; w <= setting.areaWidth + 1 ; w++) {
        let { gx, gy } = calcGridPosition(w, h, gridSize);
        this.strokeSquare(context, gx + gridOffX, gy + gridOffY, gridSize);
        context.fillText((w + 1).toString() + '-' + (h + 1).toString(), gx + gridOffX + (gridSize / 2), gy + gridOffY + (gridSize / 2));
      }
    }
    
    this.makeBrush(context, gridSize, setting.rangeColor);
    context.beginPath();
    
    context.moveTo(cx + offSetX_px, cy + offSetY_px);
    context.lineTo(p1x + offSetX_px, p1y + offSetY_px);
    context.stroke();

    context.moveTo(p1x + offSetX_px, p1y + offSetY_px);
    context.lineTo(p2x + offSetX_px, p2y + offSetY_px);
    context.stroke();

    context.moveTo(p2x + offSetX_px, p2y + offSetY_px);
    context.lineTo(cx + offSetX_px, cy + offSetY_px);
    context.stroke();

//    context.moveTo(setting.range * gridSize + offSetX_px, -0.5 * setting.width * gridSize + offSetY_px);
//    context.lineTo(setting.range * gridSize + offSetX_px, 0.5 * setting.width * gridSize + offSetY_px);
//    context.stroke();
    
  }
/*
  renderCorn(width: number, height: number, gridSize: number = 50, gridType: GridType = GridType.SQUARE, gridColor: string = '#000000e6') {
    this.canvasElement.width = width * gridSize;
    this.canvasElement.height = height * gridSize;
    let context: CanvasRenderingContext2D = this.canvasElement.getContext('2d');

//    if (gridType < 0) return;

    let calcGridPosition: StrokeGridFunc = this.generateCalcGridPositionFunc(gridType);
    this.makeBrush(context, gridSize, gridColor);
    for (let h = 0; h <= height; h++) {
      for (let w = 0; w <= width; w++) {
        let { gx, gy } = calcGridPosition(w, h, gridSize);
        this.strokeSquare(context, gx, gy, gridSize);
        context.fillText((w + 1).toString() + '-' + (h + 1).toString(), gx + (gridSize / 2), gy + (gridSize / 2));
      }
    }
  }
*/
  private generateCalcGridPositionFunc(gridType: GridType): StrokeGridFunc {
    switch (gridType) {

// 将来用 現状はスクエアのみ対応
/*
      case GridType.HEX_VERTICAL: // ヘクス縦揃え
        return (w, h, gridSize) => {
          if ((w % 2) === 1) {
            return { gx: w * gridSize, gy: h * gridSize };
          } else {
            return { gx: w * gridSize, gy: h * gridSize + (gridSize / 2) };
          }
        }

      case GridType.HEX_HORIZONTAL: // ヘクス横揃え(どどんとふ互換)
        return (w, h, gridSize) => {
          if ((h % 2) === 1) {
            return { gx: w * gridSize, gy: h * gridSize };
          } else {
            return { gx: w * gridSize + (gridSize / 2), gy: h * gridSize };
          }
        }
*/
      default: // スクエア(default)
        return (w, h, gridSize) => {
          return { gx: w * gridSize, gy: h * gridSize };
        }
    }
  }

  private strokeSquare(context: CanvasRenderingContext2D, gx: number, gy: number, gridSize: number) {
    context.beginPath();
    context.strokeRect(gx, gy, gridSize, gridSize);
  }

  private strokeHex(context: CanvasRenderingContext2D, gx: number, gy: number, gridSize: number, gridType: GridType) {
    let deg = gridType === GridType.HEX_HORIZONTAL ? -30 : 0;
    let radius = gridSize / Math.sqrt(3);
    let cx = gx + gridSize / 2;
    let cy = gy + gridSize / 2;

    context.beginPath();
    for (let i = 0; i < 6; i++) {
      deg += 60;
      let radian = Math.PI / 180 * deg;
      let x = Math.cos(radian) * radius + cx;
      let y = Math.sin(radian) * radius + cy;
      context.lineTo(x, y);
    }
    context.closePath();
    context.stroke();
  }
}
