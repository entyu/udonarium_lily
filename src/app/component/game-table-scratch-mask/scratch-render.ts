import { GridType } from '@udonarium/game-table';
import { GameTableScratchMask } from '@udonarium/game-table-scratch-mask';

type StrokeGridFunc = (w: number, h: number, gridSize: number) => GridPosition;
type GridPosition = { gx: number, gy: number };

export interface ScratchSetting {
  mask: GameTableScratchMask;
  areaWidth: number;
  areaHeight: number;
  centerX: number;
  centerY: number;
  gridSize: number;
  fanDegree: number;
  gridColor: string;
  changeColor: string;
}

export class ScratchRender {
  constructor(
    readonly canvasElement: HTMLCanvasElement,
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

  renderScratch(setting: ScratchSetting, myScratch: boolean){
    let gridSize = setting.gridSize;

    this.canvasElement.width = setting.areaWidth * gridSize;
    this.canvasElement.height = setting.areaHeight * gridSize;
    let context: CanvasRenderingContext2D = this.canvasElement.getContext('2d');

    let gcx = 0.0;
    let gcy = 0.0;

    this.makeBrush(context, gridSize, setting.gridColor);

    for (let h = 0; h <= setting.areaHeight ; h++) {
      for (let w = 0; w <= setting.areaWidth ; w++) {
        // 全部trueで内側にある
        if (myScratch){
          if( setting.mask.getMapXY(w, h, myScratch) ){
            this.fillSquare(context, w * gridSize , h * gridSize , gridSize);
          }
        }else{
          if( setting.mask.getMapXY(w, h, myScratch) ){
            this.fillSquare(context, w * gridSize , h * gridSize , gridSize);
          }
        }
      }
    }

    if (myScratch){
      this.makeBrush(context, gridSize, setting.changeColor);

      for (let h = 0; h <= setting.areaHeight ; h++) {
        for (let w = 0; w <= setting.areaWidth ; w++) {
          // 全部trueで内側にある
          if( setting.mask.isMapXYChange(w, h) ){
            this.strokeSquare(context, w * gridSize + 5 , h * gridSize + 5 , gridSize - 10);
          }
        }
      }
    }
    
  }

  private fillSquare(context: CanvasRenderingContext2D, gx: number, gy: number, gridSize: number) {
    context.beginPath();
    context.fillRect(gx, gy, gridSize, gridSize);
  }

  private strokeSquare(context: CanvasRenderingContext2D, gx: number, gy: number, gridSize: number) {
    context.lineWidth = 2;
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
