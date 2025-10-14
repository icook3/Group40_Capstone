export class Cloud {

  constructor({ sceneEl }) {
    this.sceneEl = sceneEl;

    //DOESN'T ARGUE ABOUT FINDING THE GLB BUT DOESN'T APPEAR TO DO ANYTHING EITHER

    // Load gltf cloud model
    //const cloudAssets = document.createElement('a-assets');
    //const cloud1 = document.createElement('a-asset-item');
    //cloud1.setAttribute('id','cloud1');
    //cloud1.setAttribute('src','resources/images/cloud1.glb');
    //cloudAssets.appendChild(cloud1);
    //console.log(cloudAssets)
           

    // Create a-entity for the clouds and set ID
    const clouds = document.createElement('a-entity');
    //clouds.setAttribute('id','clouds');



    //const cloudTest = document.createElement('a-entity')

    clouds.setAttribute('gltf-model','#cloud1');
    clouds.setAttribute('position','-10 22 -30');
    
    //clouds.appendChild(cloudTest);
    console.log(clouds);

    sceneEl.appendChild(clouds);

    //gltf-model="#Cabin"



    // Create clouds
    const cloud_dimensions = [
      [7,0.7,-40,22,-120],
      [5,0.6,-32,23,-110],
      [6,0.65,-36,21,-130],
      [8,0.7,35,24,-140],
      [6,0.6,42,23,-150],
      [5,0.5,38,25,-135],
      [4,0.5,0,28,-160],
      [6,0.6,-10,26,-170],
      [18,0.55,-70,22,-60],
      [12,0.5,-85,25,-75],
      [10,0.45,-60,20,-45],
      [17,0.55,70,23,-65],
      [13,0.5,85,26,-80],
      [11,0.45,60,21,-50],
      [10,0.35,-25,38,-70],
      [8,0.32,25,40,-80],
      [12,0.3,0,42,-90],
      [7,0.28,-50,36,-100],
      [9,0.3,50,37,-110],
      [18,0.18,-60,55,-180],
      [15,0.15,60,58,-200],
      [20,0.12,0,60,-220],
      [13,0.14,-80,53,-160],
      [11,0.13,80,54,-170]
    ]

    //for (let i = 0; i < cloud_dimensions.length; i++) {
      //const circle = document.createElement('a-entity');
      //circle.setAttribute('geometry', `primitive: sphere; radius: ${cloud_dimensions[i][0]}`);
      //circle.setAttribute('material', `color: #fff; opacity: ${cloud_dimensions[i][1]}; transparent: true`);
      //circle.setAttribute('position', `${cloud_dimensions[i][2]} ${cloud_dimensions[i][3]} ${cloud_dimensions[i][4]}`);
      //clouds.appendChild(circle);
    //}

    // Add the clouds into the scene
    //sceneEl.appendChild(clouds);
  }
}