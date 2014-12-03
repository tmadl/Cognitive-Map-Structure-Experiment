function sigmoid(x) {
    return 1.0 / (1.0 + Math.exp(-x));

};

function gradientDescent(theta, gradient, alpha) {
    return numeric.sub(theta, numeric.mul(gradient(theta), alpha));
}



var permArr = [], usedChars = [];
function permutations(input) {
	permArr = []; usedChars = [];
	return perms(input);
}
function perms(input) {
    var i, ch;
    for (i = 0; i < input.length; i++) {
        ch = input.splice(i, 1)[0];
        try {
        	usedChars.push(ch);
      	}
      	catch (ex) {
      		usedChars.push(ch);
      	}
        if (input.length == 0) {
            permArr.push(usedChars.slice());
        }
        perms(input);
        input.splice(i, 0, ch);
        usedChars.pop();
    }
    return permArr;
};

function arrayContains(arr1, arr2) {
	for (var i = 0; i < arr1.length - arr2.length + 1; i++) {
		var correct = 0;
		for (var j = 0; j < arr2.length; j++) {
			if (arr1[i+j] == arr2[j]) 
				correct++;
			else
				break;
		}
		if (correct == arr2.length)
			return true;
	} 
	return false;
}

function k_combinations(set, k) {
	var i, j, combs, head, tailcombs;
	if (k > set.length || k <= 0) {
		return [];
	}
	if (k == set.length) {
		return [set];
	}
	if (k == 1) {
		combs = [];
		for (i = 0; i < set.length; i++) {
			combs.push([set[i]]);
		}
		return combs;
	}
	combs = [];
	for (i = 0; i < set.length - k + 1; i++) {
		head = set.slice(i, i+1);
		tailcombs = k_combinations(set.slice(i + 1), k - 1);
		for (j = 0; j < tailcombs.length; j++) {
			combs.push(head.concat(tailcombs[j]));
		}
	}
	return combs;
}

function range(start, end) {
    var foo = [];
    for (var i = start; i <= end; i++) {
        foo.push(i);
    }
    return foo;
}

function shuffle(arr) {
	if (typeof arr == "number") {
		var a = [];
		for (var i=0; i<arr; i++) {
			a.push(i);
		}		
		return shuffle(a);
	}
	else {
		return arr.sort(function(a,b) {return Math.random()*2-1;});
	}
}

// random

function normal_random(mean, variance) {
    if (mean == undefined)
        mean = 0.0;
    if (variance == undefined)
        variance = 1.0;
    var V1, V2, S;
    var j = 0;
    do {
        var U1 = Math.random();
        var U2 = Math.random();
        V1 = 2 * U1 - 1;
        V2 = 2 * U2 - 1;
        S = V1 * V1 + V2 * V2;
    } while (S > 1);

    X = Math.sqrt(-2 * Math.log(S) / S) * V1;
    X = mean + Math.sqrt(variance) * X;
    
    if (isNaN(X)) return normal_random(mean, variance);
    
    return X;
}

function drawRandom(list, n) {
	var result = [];
	for (var i=0; i<n; i++) {
		do {
			r = list[Math.floor(Math.random()*list.length)];
		} while (result.indexOf(r) > -1);
		result[i] = r;
	}
	return result;
}


// misc

function containsVector(mat, vec) {
	for (var i = 0; i < mat.length; i++) {
		if (mat[i].length != vec.length) continue;
		var c = true;
		for (var j = 0; j < vec.length; j++) {
			if (mat[i][j] != vec[j]) {
				c = false;
				break;
			} 
		}
		if (c) return true;
	}
	return false;
}


if(typeof(String.prototype.trim) === "undefined")
{
    String.prototype.trim = function() 
    {
        return String(this).replace(/^\s+|\s+$/g, '');
    };
}


/*
function stringDifference(str1, str2) {
    var dist = 0;
 
    str1 = str1.trim().toLowerCase();
    str2 = str2.trim().toLowerCase();
 
 	var L = Math.max(str1.length, str2.length);
    for(var i = 0; i < L; i++) {
        if(!str1[i] || !str2[i] || str2[i] !== str1[i]) {
            dist++;
        } 
    }
 
    return dist;
}
*/


function stringDifference(a, b) {
  if(a.length === 0) return b.length; 
  if(b.length === 0) return a.length; 
 
  var matrix = [];
 
  // increment along the first column of each row
  var i;
  for(i = 0; i <= b.length; i++){
    matrix[i] = [i];
  }
 
  // increment each column in the first row
  var j;
  for(j = 0; j <= a.length; j++){
    matrix[0][j] = j;
  }
 
  // Fill in the rest of the matrix
  for(i = 1; i <= b.length; i++){
    for(j = 1; j <= a.length; j++){
      if(b.charAt(i-1) == a.charAt(j-1)){
        matrix[i][j] = matrix[i-1][j-1];
      } else {
        matrix[i][j] = Math.min(matrix[i-1][j-1] + 1, // substitution
                                Math.min(matrix[i][j-1] + 1, // insertion
                                         matrix[i-1][j] + 1)); // deletion
      }
    }
  }
 
  return matrix[b.length][a.length];
};