###Piece Swap###

Shaving Mid Piece
-----------------

Current working code...

1. Converts the points back to a matrix 
2. Excludes the row which the same y as the lineFull
3. Sets the new matrix back onto the current rotation

```
var lineFull = {y:-11}
E('Points').each(function(points,e){
  var pos = E('Position',e);
  var rotations = E('Rotations',e);
  matrix = [];
  _(points).each(function(point,i){
    var internalY = point.y - pos.y;
    var rowWorldY = pos.y + internalY;
    var row = matrix[internalY] || [];
    if(rowWorldY != lineFull.y){
      row = row || [];
      row[point.x - pos.x] = 1;
      matrix[internalY] = row;
    }
    //replace the matrix with the shaved one
    rotations.positions[rotations.i] = _(matrix).compact() //remove cleared row
  })
})
```

Not sure if all the blocks above that row will need to have a 1 added to their y or not.  As they won't have gravity enabled anymore.

Lose Condition
--------------

There also needs to be a system that doesn't spawn when your piece hits the top and has nowhere to go.# css
