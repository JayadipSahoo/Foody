import SHA256 from "crypto-js/sha256";

const hashItemSnapshot = (item) => {
  const data = {
    name: item.name,
    price: item.price,
    isVeg: item.isVeg,
    isAvailable: item.isAvailable
  };
  const str = JSON.stringify(data);
  return SHA256(str).toString();
};

export default hashItemSnapshot;
