//=======================================//
//=========== START OF MODULE ===========//
//============= Version 0.9 =============//


//Calcs date from API
module.exports.calcDate = (df, str) => {
  //df = new DateFormatter()
  df.dateFormat = 'HH:mm'
  return df.string(new Date(str))
};


module.exports.remainingTime = (usedTS, sec) => {
   //target = new Date(Date.now() + sec * 1000)
   //log(target)
	return new Date(usedTS + sec * 1000)
};


//Saves Images from web
module.exports.saveImages = async (fm, dir) => {
      url = 'https://raw.githubusercontent.com/iamrbn/Telekom-Progress/main/Images/'
      imgs = ['Telekom.png']
      
      for (img of imgs){
          imgPath = fm.joinPath(dir, img)
          if (!fm.fileExists(imgPath)){
          request = new Request(url + img)
          image = await request.loadImage()
          fm.writeImage(imgPath, image)
          console.warn('Image '+ image +' saved in iCloud')
        }
      }
     };

module.exports.getSF = (ground, name, fontSize, color, sizeW, sizeH) => {

	sf = SFSymbol.named(name)
	sf.applyFont(new Font("Menlo-Regular", fontSize))
	sf.applySemiboldWeight()
	symbol = ground.addImage(sf.image)
	symbol.tintColor = color
	symbol.imageSize = new Size(sizeW, sizeH)
	symbol.centerAlignImage()
	
};


module.exports.createCircle = async  (value) => {
  if (value > 1) value /= 100
  if (value < 0) value = 0
  if (value > 1) value = 1

  let webView = new WebView()
  await webView.loadHTML('<canvas id="c"></canvas>')

  let base64 = await webView.evaluateJavaScript(
    `
    //let colour = "#FFFFFF",
    //background = "#000000",
    size = 57*3,
    lineWidth = 5*3,
    percent = ${value * 100}
      
    let canvas = document.getElementById('c'),
    c = canvas.getContext('2d')
    canvas.width = size
    canvas.height = size 
    let posX = canvas.width / 2,
    posY = canvas.height / 2,
    onePercent = 360 / 100,
    result = onePercent * ${value * 100}
    c.lineCap = 'round'
    c.beginPath()
    c.arc( posX, posY, (size-lineWidth-1)/2, (Math.PI/180) * 270, (Math.PI/180) * (270 + 360) )
    c.strokeStyle = "#000000"
    c.lineWidth = lineWidth 
    c.stroke()
    c.beginPath()
    c.strokeStyle = "#FFFFFF"
    c.lineWidth = lineWidth
    c.arc( posX, posY, (size-lineWidth-1)/2, (Math.PI/180) * 270, (Math.PI/180) * (270 + result) )
    c.stroke()
    completion(canvas.toDataURL().replace("data:image/png;base64,",""))`,
    true
  );
  
 //image = Image.fromData(Data.fromBase64String(base64))

  return Image.fromData(Data.fromBase64String(base64))
};


//Loads images from iCloud
module.exports.getImageFor = async (fm, dir, name) => {
  imgPath = fm.joinPath(dir, name + ".png")
  await fm.downloadFileFromiCloud(imgPath)
 return await fm.readImage(imgPath)
};


//Create progress bar
module.exports.createProgress = (initialVolume, bgColor, fillColor, width, height, value, c1, c2) => {
  let day = new Date().getDate()//day of the current month
  let currentDays = new Date(new Date().getFullYear(), new Date().getDay(), 0).getDate()//days of the month
  let eachStep = Math.round(width/currentDays)//each day as step in the progress bar
  let calc = day * currentDays
  
  let dailyUse = (initialVolume / currentDays).toFixed(4)
       console.log({dailyUse})
  let todayStatus = dailyUse * day
      //console.log({todayStatus})
  
  let context = new DrawContext();
      context.size = new Size(width, height)  
      context.opaque = false
      context.respectScreenScale = true
      context.setFillColor(bgColor)//#8E8E92 grau
  
  let path = new Path()
      path.addRoundedRect(new Rect(0, 0, width, height), c1, c2)
      context.addPath(path)
      context.fillPath()
      context.setFillColor(new Color(fillColor))
  
  let path1 = new Path()
  let path1width = (width * value) / initialVolume > width ? width : (width * value) / initialVolume
      //console.log({path1width})
      path1.addRoundedRect(new Rect(0, 0, path1width, height), c1, c2)
      context.setTextAlignedCenter()
      context.addPath(path1)  
      context.fillPath()
        
  let path2 = new Path()
  let path2width = (width * todayStatus) / initialVolume > width ? width : (width * todayStatus) / initialVolume
      //console.log({path2width})
      path2.addRect(new Rect(path2width, 0, 1.5, height))
      context.addPath(path2) 
      context.setFillColor(Color.white()) 
      context.fillPath()

return context.getImage()
};


//Checks if's there an server update on GitHub available
module.exports.updateCheck = async (fm, modulePath, version) => {
  url = 'https://raw.githubusercontent.com/iamrbn/Telekom-Progress/main/'
  endpoints = ['Telekom-Progress.js', 'telekomModule.js']
  
    let uC;
    try {
      updateCheck = new Request(url+endpoints[0]+'on')
      uC = await updateCheck.loadJSON()
    } catch (e){
        return log(e)
    }

  needUpdate = false
  if (uC.version > version){
      needUpdate = true
    if (config.runsInApp){
      //console.error(`New Server Version ${uC.version} Available`)
          newAlert = new Alert()
          newAlert.title = `New Server Version ${uC.version} Available!`
          newAlert.addAction("OK")
          newAlert.addDestructiveAction("Later")
          newAlert.message="Changes:\n" + uC.notes + "\n\nOK starts the download from GitHub\n More informations about the update changes go to the GitHub Repo"
      if (await newAlert.present() == 0){
        	reqCode = new Request(url+endpoints[0])
        	updatedCode = await reqCode.loadString()
        	pathCode = fm.joinPath(fm.documentsDirectory(), `${Script.name()}.js`)
        	fm.writeString(pathCode, updatedCode)
        	reqModule = new Request(url+endpoints[1])
        	moduleFile = await reqModule.loadString()
        	fm.writeString(modulePath, moduleFile)
        	throw new Error("Update Complete!")
      }
    }
  } else  log("\n>> SCRIPT IS UP TO DATE!")
  
  return {uC, needUpdate}
};


//=========================================//
//============== END OF MODULE ============//
//=========================================//