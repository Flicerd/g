function to_base64(text) {
    buffer = Buffer.from(text);
    return buffer.toString("base64");
};
function from_base64(text) {
    buffer = Buffer.from(text, "base64");
    return buffer.toString("ascii");
};

function reverse(s){
    return s.split("").reverse().join("");
};

function encrypt(msg,key) {
  function serialize(m) {
    m = reverse(m);
    let cs = [];
    for (let i = 0; i < m.length; i++) {
      cs.push(m.charCodeAt(i));
    };
    return cs;
  };

  function deserialize(cs) {
    let A = "";
    cs.forEach(function(value,index) {
      A += String.fromCharCode(value);
    });
    return reverse(A);
  };

  function loadBlock(cs) {
    let rows = 3;
    let block = [];
    let ns = Math.ceil(cs.length / rows);

    for (let i = 0; i < ns; i++) {
      block.push([]);
    };

    let n = 1;
    cs.forEach(function(value,index) {
      block[n - 1].push(value);
      if (block[n - 1].length >= rows) {
        n++;
      };
    });

    return block;
  };

  function unloadBlock(block) {
    let nt = [];
    block.forEach(function(value,index) {
      value.forEach(function(value2,index2) {
        nt.push(value2);
      });
    });
    return nt;
  };

  function shuffleBlock(block) {
    let vValues = [12,14,16,18,20,22,24,26,28];

    function mixVs(t) {
      let nt = [];
      let n = 1;

      t.forEach(function(value,index) {
        let product = (value ^ vValues[n - 1]);
        nt.push(product);

        if (n > vValues.length) {
          n = 0;
        };
        n++;
      });

      return nt;
    };

    function roundBlock(b) {
      let aBlock = [];
      b.forEach(function(value,index) {
        aBlock.push(mixVs(value));
      });
      return aBlock;
    };

    return roundBlock(block);
  };

  function fuse(s1,s2) {
    let entity = [];
    let n = 1;

    s1.forEach(function(value,index) {
      let product = (value ^ s2[n - 1]);
      if (n >= s2.length) {
        n = 0;
      };
      n++;

      entity.push(product);
    });

    return entity
  };

  function Round(m,k) {
    let MSG = serialize(m)
    let KEY = serialize(k);

    let Block = loadBlock(MSG);
    let ShuffledBlock = shuffleBlock(Block);
    let SolvedBlock = unloadBlock(ShuffledBlock);

    let Entity = fuse(SolvedBlock,KEY);
    let Solved = deserialize(Entity);

    return Solved;
  };

  return to_base64(Round(msg,key));
};

function decrypt(msg,key)
{
  let cipher = from_base64(msg);
  return from_base64(encrypt(cipher,key));
};

let syn4 = {};
syn4["encrypt"] = encrypt;
syn4["decrypt"] = decrypt;

module.exports.syn4 = syn4
