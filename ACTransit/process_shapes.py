from collections import defaultdict
import json

if __name__ == "__main__":
  with open ("./ACTransit-gtfs/shapes.txt", "r") as f:
    # shape_id,shape_pt_lat,shape_pt_lon,shape_pt_sequence,shape_dist_traveled
    # shp-10-01,37.670102,-122.087087,1,0.00
    shapes = defaultdict(list)
    for line in f.readlines()[1:]:  # skip headers
      shape_id, lat, lon, seq, dist = line.split(",")
      shapes[shape_id].append((lat, lon))
    print(f"Loaded {len(shapes)} shape id's")

  # convert to json map of shapes, and don't be wasteful
  reformed = {k: {"lats": [float(elem[0]) for elem in v], "lons": [float(elem[1]) for elem in v]} for k, v in shapes.items()}
  with open ("./shapes.json", "w") as f:
    dumped = json.dumps(reformed, indent=2, sort_keys=True)
    dumped = dumped.replace("\n      ", "")
    dumped = dumped.replace("\n    ]", "]")
    f.write(dumped)
    print(f"Wrote 'shapes.json' with a more convenient format")
