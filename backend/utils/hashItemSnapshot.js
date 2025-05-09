const crypto = require("crypto");

const hashItemSnapshot = (item) => {
  const data = {
    name: item.name,
    price: item.price,
    isVeg: item.isVeg,
    isAvailable: item.isAvailable
  };
  const str = JSON.stringify(data);
  return crypto.createHash("sha256").update(str).digest("hex");
};

module.exports = hashItemSnapshot; 