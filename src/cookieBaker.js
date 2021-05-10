export function setCookie(cname, cvalue, exdays) {
  var d = new Date();
  d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
  var expires = "expires=" + d.toUTCString();
  document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}

export function getCookie(name) {
  const value = "; " + document.cookie;
  const parts = value.split("; " + name + "=");
  if (parts.length == 2) {
    const vlu = parts.pop().split(";").shift();
    const decode_vlu = decodeURIComponent(vlu);
    const replace_vlu = decode_vlu.replace(/[+]/, " ");
    const temp = replace_vlu.split(",")
    if (temp.length > 1)
      return JSON.parse(replace_vlu.replace("j:", ""));
    else
      return replace_vlu
  }
  else
    return "";
}

export function checkCookie() {
  var user = getCookie("username");
  if (user != "") {
    alert("Welcome again " + user);
  } else {
    user = prompt("Please enter your name:", "");
    if (user != "" && user != null) {
      setCookie("username", user, 365);
    }
  }
}