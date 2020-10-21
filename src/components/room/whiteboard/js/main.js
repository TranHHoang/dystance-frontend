/* eslint-disable @typescript-eslint/no-use-before-define */
/* eslint-disable @typescript-eslint/camelcase */
import keymage from "keymage";
import whiteboard from "./whiteboard";
import keybinds from "./keybinds";
import Picker from "vanilla-picker";
import shortcutFunctions from "./shortcutFunctions";
import ReadOnlyService from "./services/ReadOnlyService";
import ConfigService from "./services/ConfigService";
import Axios from "~utils/fakeAPI";
import { hostName } from "~utils/hostUtils";
import { socket } from "../../room-component/roomSlice";
import { getLoginData } from "~utils/tokenStorage";

let whiteboardId;
const myUsername = (getLoginData() || {}).userName;

function main(roomId) {
  whiteboardId = roomId;
  socket.on("WhiteboardConfig", (serverResponse) => {
    console.log("WhiteboardConfig", JSON.parse(serverResponse));
    ConfigService.initFromServer(JSON.parse(serverResponse));
    // Inti whiteboard only when we have the config from the server
    initWhiteboard();
  });

  socket.on("DrawToWhiteboard", function (content) {
    whiteboard.handleEventsAndData(JSON.parse(content), true);
  });

  socket.on("RefreshUserBadges", function () {
    whiteboard.refreshUserBadges();
  });
  socket.invoke("JoinWhiteboard", whiteboardId);
}

function showBasicAlert(html, newOptions) {
  const options = {
    header: "INFO MESSAGE",
    okBtnText: "Ok",
    headercolor: "#FE4849",
    hideAfter: false,
    onOkClick: false
  };
  if (newOptions) {
    for (const i in newOptions) {
      options[i] = newOptions[i];
    }
  }
  const alertHtml = $(
    '<div class="basicalert" style="position:absolute; left:0px; width:100%; top:70px;">' +
      '<div style="width: 30%; margin: auto; background: rgba(74,76,82,1);  border-radius: 5px; font-size: 1.2em; border: 1px solid gray;">' +
      '<div style="border-bottom: 1px solid #676767; background: ' +
      options["headercolor"] +
      '; padding-left: 5px; font-size: 0.8em; color: white">' +
      options["header"] +
      '<div style="float: right; margin-right: 4px; color: #373737; cursor: pointer;" class="closeAlert">x</div></div>' +
      '<div style="padding: 10px; color: white;" class="htmlcontent"></div>' +
      '<div style="height: 20px; padding: 10px;"><button class="modalBtn okbtn" style="float: right;">' +
      options["okBtnText"] +
      "</button></div>" +
      "</div>" +
      "</div>"
  );
  alertHtml.find(".htmlcontent").append(html);
  $("body").append(alertHtml);
  alertHtml
    .find(".okbtn")
    .off("click")
    .click(function () {
      if (options.onOkClick) {
        options.onOkClick();
      }
      alertHtml.remove();
    });
  alertHtml
    .find(".closeAlert")
    .off("click")
    .click(function () {
      alertHtml.remove();
    });

  if (options.hideAfter) {
    setTimeout(function () {
      alertHtml.find(".okbtn").click();
    }, 1000 * options.hideAfter);
  }
}

function initWhiteboard() {
  $(document).ready(function () {
    // by default set in readOnly mode
    // ReadOnlyService.activateReadOnlyMode();

    whiteboard.loadWhiteboard("#whiteboardContainer", {
      //Load the whiteboard
      whiteboardId: whiteboardId,
      username: btoa(myUsername),
      sendFunction: function (content) {
        if (ReadOnlyService.readOnlyActive) return;
        socket.invoke("DrawToWhiteboard", whiteboardId, JSON.stringify(content));
      }
    });

    // request whiteboard from server

    Axios.get(`${hostName}/api/rooms/whiteboard/load?id=${whiteboardId}`).then(function (response) {
      console.log(response.data);
      whiteboard.loadData(response.data);
    });

    /*----------------/
        Whiteboard actions
        /----------------*/

    let tempLineTool = false;
    let strgPressed = false;
    //Handle key actions
    $(document).on("keydown", function (e) {
      if (e.which == 16) {
        if (whiteboard.tool == "pen" && !strgPressed) {
          tempLineTool = true;
          whiteboard.ownCursor.hide();
          if (whiteboard.drawFlag) {
            whiteboard.mouseup({
              offsetX: whiteboard.prevPos.x,
              offsetY: whiteboard.prevPos.y
            });
            shortcutFunctions.setTool_line();
            whiteboard.mousedown({
              offsetX: whiteboard.prevPos.x,
              offsetY: whiteboard.prevPos.y
            });
          } else {
            shortcutFunctions.setTool_line();
          }
        }
        whiteboard.pressedKeys["shift"] = true; //Used for straight lines...
      } else if (e.which == 17) {
        strgPressed = true;
      }
      //console.log(e.which);
    });
    $(document).on("keyup", function (e) {
      if (e.which == 16) {
        if (tempLineTool) {
          tempLineTool = false;
          shortcutFunctions.setTool_pen();
          whiteboard.ownCursor.show();
        }
        whiteboard.pressedKeys["shift"] = false;
      } else if (e.which == 17) {
        strgPressed = false;
      }
    });

    //Load keybindings from keybinds.js to given functions
    Object.entries(keybinds).forEach(([key, functionName]) => {
      const associatedShortcutFunction = shortcutFunctions[functionName];
      if (associatedShortcutFunction) {
        keymage(key, associatedShortcutFunction, { preventDefault: true });
      } else {
        console.error("Function you want to keybind on key:", key, "named:", functionName, "is not available!");
      }
    });

    // whiteboard clear button
    $("#whiteboardTrashBtn")
      .off("click")
      .click(function () {
        $("#whiteboardTrashBtnConfirm").show().focus();
        $(this).css({ visibility: "hidden" });
      });

    $("#whiteboardTrashBtnConfirm").mouseout(function () {
      $(this).hide();
      $("#whiteboardTrashBtn").css({ visibility: "inherit" });
    });

    $("#whiteboardTrashBtnConfirm")
      .off("click")
      .click(function () {
        $(this).hide();
        $("#whiteboardTrashBtn").css({ visibility: "inherit" });
        whiteboard.clearWhiteboard();
      });

    // undo button
    $("#whiteboardUndoBtn")
      .off("click")
      .click(function () {
        whiteboard.undoWhiteboardClick();
      });

    // redo button
    $("#whiteboardRedoBtn")
      .off("click")
      .click(function () {
        whiteboard.redoWhiteboardClick();
      });

    // view only
    $("#whiteboardLockBtn")
      .off("click")
      .click(() => {
        ReadOnlyService.deactivateReadOnlyMode();
      });
    $("#whiteboardUnlockBtn")
      .off("click")
      .click(() => {
        ReadOnlyService.activateReadOnlyMode();
      });
    $("#whiteboardUnlockBtn").hide();
    $("#whiteboardLockBtn").show();

    // switch tool
    $(".whiteboard-tool")
      .off("click")
      .click(function () {
        $(".whiteboard-tool").removeClass("active");
        $(this).addClass("active");
        const activeTool = $(this).attr("tool");
        whiteboard.setTool(activeTool);
        if (activeTool == "mouse" || activeTool == "recSelect") {
          $(".activeToolIcon").empty();
        } else {
          $(".activeToolIcon").html($(this).html()); //Set Active icon the same as the button icon
        }
      });

    // upload image button
    $("#addImgToCanvasBtn")
      .off("click")
      .click(function () {
        if (ReadOnlyService.readOnlyActive) return;
        showBasicAlert("Please drag the image into the browser.");
      });

    // save image as imgae
    $("#saveAsImageBtn")
      .off("click")
      .click(function () {
        whiteboard.getImageDataBase64(
          {
            imageFormat: ConfigService.imageDownloadFormat
          },
          function (imgData) {
            const a = document.createElement("a");
            a.href = imgData;
            a.download = "whiteboard." + ConfigService.imageDownloadFormat;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
          }
        );
      });

    let btnsMini = false;
    $("#minMaxBtn")
      .off("click")
      .click(function () {
        if (!btnsMini) {
          $("#toolbar").find(".btn-group:not(.minGroup)").hide();
          $(this).find("#minBtn").hide();
          $(this).find("#maxBtn").show();
        } else {
          $("#toolbar").find(".btn-group").show();
          $(this).find("#minBtn").show();
          $(this).find("#maxBtn").hide();
        }
        btnsMini = !btnsMini;
      });

    // On thickness slider change
    $("#whiteboardThicknessSlider").on("input", function () {
      if (ReadOnlyService.readOnlyActive) return;
      whiteboard.setStrokeThickness($(this).val());
    });

    // handle drag&drop
    let dragCounter = 0;
    $("#whiteboardContainer").on("dragenter", function (e) {
      if (ReadOnlyService.readOnlyActive) return;
      e.preventDefault();
      e.stopPropagation();
      dragCounter++;
      whiteboard.dropIndicator.show();
    });

    $("#whiteboardContainer").on("dragleave", function (e) {
      if (ReadOnlyService.readOnlyActive) return;

      e.preventDefault();
      e.stopPropagation();
      dragCounter--;
      if (dragCounter === 0) {
        whiteboard.dropIndicator.hide();
      }
    });

    $("#whiteboardContainer").on("drop", function (e) {
      //Handle drop
      if (ReadOnlyService.readOnlyActive) return;

      if (e.originalEvent.dataTransfer) {
        if (e.originalEvent.dataTransfer.files.length) {
          //File from harddisc
          e.preventDefault();
          e.stopPropagation();
          const filename = e.originalEvent.dataTransfer.files[0]["name"];
          if (isImageFileName(filename)) {
            const blob = e.originalEvent.dataTransfer.files[0];
            const reader = new window.FileReader();
            reader.readAsDataURL(blob);
            reader.onloadend = function () {
              const base64data = reader.result;
              uploadImgAndAddToWhiteboard(base64data);
            };
          } else {
            showBasicAlert("File must be an image!");
          }
        } else {
          //File from other browser

          const fileUrl = e.originalEvent.dataTransfer.getData("URL");
          const imageUrl = e.originalEvent.dataTransfer.getData("text/html");
          const rex = /src="?([^"\s]+)"?\s*/;
          let url = rex.exec(imageUrl);
          if (url && url.length > 1) {
            url = url[1];
          } else {
            url = "";
          }

          isValidImageUrl(fileUrl, function (isImage) {
            if (isImage && isImageFileName(url)) {
              whiteboard.addImgToCanvasByUrl(fileUrl);
            } else {
              isValidImageUrl(url, function (isImage) {
                if (isImage) {
                  if (isImageFileName(url) || url.startsWith("http")) {
                    whiteboard.addImgToCanvasByUrl(url);
                  } else {
                    uploadImgAndAddToWhiteboard(url); //Last option maybe its base64
                  }
                } else {
                  showBasicAlert("Can only upload Imagedata!");
                }
              });
            }
          });
        }
      }
      dragCounter = 0;
      whiteboard.dropIndicator.hide();
    });

    new Picker({
      parent: $("#whiteboardColorpicker")[0],
      color: "#000000",
      onChange: function (color) {
        whiteboard.setDrawColor(color.rgbaString);
      }
    });

    // on startup select mouse
    shortcutFunctions.setTool_mouse();
    // fix bug cursor not showing up
    whiteboard.refreshCursorAppearance();

    if (process.env.NODE_ENV === "production") {
      if (ConfigService.readOnlyOnWhiteboardLoad) ReadOnlyService.activateReadOnlyMode();
      else ReadOnlyService.deactivateReadOnlyMode();
    } else {
      // in dev
      ReadOnlyService.deactivateReadOnlyMode();
    }

    // In any case, if we are on read-only whiteboard we activate read-only mode
    if (ConfigService.isReadOnly) ReadOnlyService.activateReadOnlyMode();
  });

  //Prevent site from changing tab on drag&drop
  window.addEventListener(
    "dragover",
    function (e) {
      e = e || event;
      e.preventDefault();
    },
    false
  );
  window.addEventListener(
    "drop",
    function (e) {
      e = e || event;
      e.preventDefault();
    },
    false
  );

  function uploadImgAndAddToWhiteboard(base64data) {
    const form = new FormData();
    form.append("imagedata", base64data);
    form.append("whiteboardId", whiteboardId);

    Axios.post(`${hostName}/api/rooms/whiteboard/upload`, form, {
      headers: {
        "Content-Type": "multipart/form-data"
      }
    })
      .then((response) => {
        whiteboard.addImgToCanvasByUrl(`${hostName}/${response.data.imageUrl}`); //Add image to canvas
      })
      .catch((err) => {
        showBasicAlert("Failed to upload frame: " + JSON.stringify(err));
      });
  }

  // verify if filename refers to an image
  function isImageFileName(filename) {
    const extension = filename.split(".")[filename.split(".").length - 1];
    const known_extensions = ["png", "jpg", "jpeg", "gif", "tiff", "bmp", "webp"];
    return known_extensions.includes(extension.toLowerCase());
  }

  // verify if given url is url to an image
  function isValidImageUrl(url, callback) {
    const img = new Image();
    let timer = null;
    img.onerror = img.onabort = function () {
      clearTimeout(timer);
      callback(false);
    };
    img.onload = function () {
      clearTimeout(timer);
      callback(true);
    };
    timer = setTimeout(function () {
      callback(false);
    }, 2000);
    img.src = url;
  }

  // handle pasting from clipboard
  window.addEventListener("paste", function (e) {
    if ($(".basicalert").length > 0) {
      return;
    }
    if (e.clipboardData) {
      const items = e.clipboardData.items;
      let imgItemFound = false;
      if (items) {
        // Loop through all items, looking for any kind of image
        for (let i = 0; i < items.length; i++) {
          if (items[i].type.indexOf("image") !== -1) {
            imgItemFound = true;
            // We need to represent the image as a file,
            const blob = items[i].getAsFile();

            const reader = new window.FileReader();
            reader.readAsDataURL(blob);
            reader.onloadend = function () {
              console.log("Uploading image!");
              const base64data = reader.result;
              uploadImgAndAddToWhiteboard(base64data);
            };
          }
        }
      }

      if (!imgItemFound && whiteboard.tool != "text") {
        showBasicAlert(
          "Please Drag&Drop the image or pdf into the Whiteboard. (Browsers don't allow copy+past from the filesystem directly)"
        );
      }
    }
  });
}

export default main;
