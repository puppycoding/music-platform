# Music catalog แยกตามศิลปิน

- `guncharlie/music.json`
- `dr_fuu/music.json`
- `purpeech/music.json`
- `three_man_down/music.json`
- `index.ts` รวมข้อมูลกลับเป็น `musicCatalog`

## รูปแบบ ID เพลง
ID ถูกกำหนดใหม่ตามลำดับภายในศิลปิน เช่น `dr_fuu_001`, `three_man_down_001` โดยเริ่มนับใหม่ที่ `001` ในแต่ละไฟล์

## การจัดการเพลงชื่อซ้ำ
ตรวจชื่อเพลงซ้ำภายในศิลปินเดียวกันโดยไม่สนตัวพิมพ์เล็ก/ใหญ่และช่องว่างซ้ำ และเก็บรายการแรกไว้เพียงรายการเดียว ชื่อซ้ำระหว่างคนละศิลปินจะไม่ถูกลบ

## TypeScript
ตั้งค่า `compilerOptions` ใน `tsconfig.json` ให้มี `resolveJsonModule: true` และ `esModuleInterop: true` เพื่อ import JSON ได้
