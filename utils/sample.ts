interface Assignment {
	name: string;
	custom?:boolean;
	included:boolean;
	notes:string;
	grade: {
		letter: string;
		raw: number;
		color: string;
	};
	points: {
		earned: number;
		possible: number;
	};
	date: {
		due: Date;
		assigned: Date;
	};
	category: string;
	GradebookID:string;
}



interface Finals{
	show:boolean;
	categories:Category[];
	isSemester?:boolean;
	semesters:{show:boolean,categories:Category[]}[]

}


interface Category{
		mp:number,
		courseIndex:number,
		weight:number,
		type:"exam"|"course"
			}




interface CourseSettings{
	rounding:{percent:boolean,percentPlaces:number,mark:boolean,markPlaces:number},letterScale:
	[string,[number,number],string?][],finals?:Finals,categories?:Course["categories"],
}


interface MetaAssignments{
	name:string,
	included:boolean,
	notes:string,
	category:string,
	GradebookID:string
}


interface GlobalSettings{
	rounding:{percent:boolean,percentPlaces:number,mark:boolean,markPlaces:number},letterScale:
	[string,[number,number],string?][],categories?:undefined // categories is to be implemented
}

type Settings = {
	mode:"automatic" | "manual"
} & {
  default: CourseSettings;
} & {
  [key:string]:CourseSettings
};







interface Course {
	name: string;
	period: number;
	courseID:string;
	layoutID: number;
	room: string;
	weighted: boolean;
	identifier:string;
	settings:CourseSettings
	grade: {
		letter: string;
		raw: number;
		color: string;
	};
	teacher: {
		name: string;
		email: string;
	};
	categories: {
		name: string;
		weight: number;
		grade: {
			letter: string;
			raw: number;
			color: string;
		};
		points: {
			earned: number;
			possible: number;
		};
	}[];
	assignments: Assignment[];
}


//The ONLY case where an index returns undefined should be those such cases where the inital fetch
//returned undefined as to mean that THAT GRADE PERIOD HAS NOT ARRIVED YET

//this could be flawed if Synergy's error rate is too high
type Cache = Grades[]

interface Grades {
	courses: Course[];
	settings?:Settings;
	gpa: number;
	wgpa: number;
	period: {
		name: string;
		index: number;
	};
	periods: {
		name: string;
		index: number;
		date:{start:Date,end:Date}
	}[];
}


const grades = ( [
  {
    "settings": {
      "default": {
        "rounding": {
          "percent": true,
          "percentPlaces": 2,
          "mark": false,
          "markPlaces": 0
        },
        "letterScale": [
          ["A", [89.5, 100]],
          ["B", [79.5, 89.49]],
          ["C", [69.5, 79.49]],
          ["D", [59.5, 69.49]],
          ["E", [0, 59.49]]
        ],
        "finals": {
          "show": false,
          "categories": [
            {"mp": 1, "courseIndex": null, "weight": 0.25, "type": "course"},
            {"mp": 3, "courseIndex": null, "weight": 0.25, "type": "course"},
            {"mp": 5, "courseIndex": null, "weight": 0.25, "type": "course"},
            {"mp": 7, "courseIndex": null, "weight": 0.25, "type": "course"}
          ],
          "semesters": [
            {
              "show": true,
              "categories": [
                {"mp": 1, "courseIndex": null, "weight": 0.5, "type": "course"},
                {"mp": 3, "courseIndex": null, "weight": 0.5, "type": "course"}
              ]
            },
            {
              "show": true,
              "categories": [
                {"mp": 5, "courseIndex": null, "weight": 0.5, "type": "course"},
                {"mp": 7, "courseIndex": null, "weight": 0.5, "type": "course"}
              ]
            }
          ]
        }
      },
      "mode": "other"
    },
    "gpa": 0,
    "wgpa": 0,
    "courses": [
      {
        "name": "Sample Course 1A",
        "period": 1,
        "layoutID": 0,
        "courseID": "COURSE001A",
        "room": "000",
        "settings": {
          "rounding": {
            "percent": true,
            "percentPlaces": 2,
            "mark": false,
            "markPlaces": 0
          },
          "letterScale": [
            ["A", [89.5, 100]],
            ["B", [79.5, 89.49]],
            ["C", [69.5, 79.49]],
            ["D", [59.5, 69.49]],
            ["E", [0, 59.49]]
          ],
          "finals": {
            "show": false,
            "categories": [
              {"mp": 1, "courseIndex": 0, "weight": 0.25, "type": "course"},
              {"mp": 3, "courseIndex": 0, "weight": 0.25, "type": "course"},
              {"mp": 5, "courseIndex": 0, "weight": 0.25, "type": "course"},
              {"mp": 7, "courseIndex": 0, "weight": 0.25, "type": "course"}
            ],
            "isSemester": false,
            "semesters": [
             
            ]
          }
        },
        "identifier": "COURSE001",
        "weighted": false,
        "grade": {
          "letter": "N/A",
          "raw": NaN,
          "color": "gray"
        },
        "teacher": {
          "name": "Teacher Name",
          "email": "teacher_email@placeholder.org"
        },
        "categories": [
          {
            "name": "Category 1",
            "weight": 0.9,
            "grade": {"letter": "N/A", "raw": NaN, "color": "gray"},
            "points": {"earned": 0, "possible": 0}
          },
          {
            "name": "Category 2",
            "weight": 0.1,
            "grade": {"letter": "N/A", "raw": NaN, "color": "gray"},
            "points": {"earned": 0, "possible": 0}
          }
        ],
        "assignments": []
      }
    ],
    "period": {
      "name": "MP1",
      "index": 1
    },
    "periods": [
      {"name": "MP1 Interim", "date": {"start": "2025-08-26T04:00:00.000Z", "end": "2025-09-26T04:00:00.000Z"}, "index": 0},
      {"name": "MP1", "date": {"start": "2025-08-26T04:00:00.000Z", "end": "2025-10-31T04:00:00.000Z"}, "index": 1},
      {"name": "MP2 Interim", "date": {"start": "2025-09-29T04:00:00.000Z", "end": "2025-12-12T05:00:00.000Z"}, "index": 2},
      {"name": "MP2", "date": {"start": "2025-11-04T05:00:00.000Z", "end": "2026-01-23T05:00:00.000Z"}, "index": 3},
      {"name": "MP3 Interim", "date": {"start": "2025-12-15T05:00:00.000Z", "end": "2026-02-27T05:00:00.000Z"}, "index": 4},
      {"name": "MP3", "date": {"start": "2026-01-27T05:00:00.000Z", "end": "2026-04-14T04:00:00.000Z"}, "index": 5},
      {"name": "MP4 Interim", "date": {"start": "2026-03-02T05:00:00.000Z", "end": "2026-05-15T04:00:00.000Z"}, "index": 6},
      {"name": "MP4", "date": {"start": "2026-04-16T04:00:00.000Z", "end": "2026-06-17T04:00:00.000Z"}, "index": 7}
    ]
  },
  {
    "settings": {
      "default": {
        "rounding": {
          "percent": true,
          "percentPlaces": 2,
          "mark": false,
          "markPlaces": 0
        },
        "letterScale": [
          ["A", [89.5, 100]],
          ["B", [79.5, 89.49]],
          ["C", [69.5, 79.49]],
          ["D", [59.5, 69.49]],
          ["E", [0, 59.49]]
        ],
        "finals": {
          "show": false,
          "categories": [
            {"mp": 1, "courseIndex": null, "weight": 0.25, "type": "course"},
            {"mp": 3, "courseIndex": null, "weight": 0.25, "type": "course"},
            {"mp": 5, "courseIndex": null, "weight": 0.25, "type": "course"},
            {"mp": 7, "courseIndex": null, "weight": 0.25, "type": "course"}
          ],
          "semesters": [
            {
              "show": true,
              "categories": [
                {"mp": 1, "courseIndex": null, "weight": 0.5, "type": "course"},
                {"mp": 3, "courseIndex": null, "weight": 0.5, "type": "course"}
              ]
            },
            {
              "show": true,
              "categories": [
                {"mp": 5, "courseIndex": null, "weight": 0.5, "type": "course"},
                {"mp": 7, "courseIndex": null, "weight": 0.5, "type": "course"}
              ]
            }
          ]
        }
      },
      "mode": "other"
    },
    "gpa": 0,
    "wgpa": 0,
    "courses": [
      {
        "name": "Sample Course 1A",
        "period": 1,
        "layoutID": 0,
        "courseID": "COURSE001A",
        "room": "000",
        "settings": {
          "rounding": {
            "percent": true,
            "percentPlaces": 2,
            "mark": false,
            "markPlaces": 0
          },
          "letterScale": [
            ["A", [89.5, 100]],
            ["B", [79.5, 89.49]],
            ["C", [69.5, 79.49]],
            ["D", [59.5, 69.49]],
            ["E", [0, 59.49]]
          ],
          "finals": {
            "show": false,
            "categories": [
              {"mp": 1, "courseIndex": 0, "weight": 0.25, "type": "course"},
              {"mp": 3, "courseIndex": 0, "weight": 0.25, "type": "course"},
              {"mp": 5, "courseIndex": 0, "weight": 0.25, "type": "course"},
              {"mp": 7, "courseIndex": 0, "weight": 0.25, "type": "course"}
            ],
            "isSemester": false,
            "semesters": [
             
            ]
          }
        },
        "identifier": "COURSE001",
        "weighted": false,
        "grade": {
          "letter": "N/A",
          "raw": NaN,
          "color": "gray"
        },
        "teacher": {
          "name": "Teacher Name",
          "email": "teacher_email@placeholder.org"
        },
        "categories": [
          {
            "name": "Category 1",
            "weight": 0.9,
            "grade": {"letter": "N/A", "raw": NaN, "color": "gray"},
            "points": {"earned": 0, "possible": 0}
          },
          {
            "name": "Category 2",
            "weight": 0.1,
            "grade": {"letter": "N/A", "raw": NaN, "color": "gray"},
            "points": {"earned": 0, "possible": 0}
          }
        ],
        "assignments": []
      }
    ],
    "period": {
      "name": "MP2 Interim",
      "index": 2
    },
    "periods": [
      {"name": "MP1 Interim", "date": {"start": "2025-08-26T04:00:00.000Z", "end": "2025-09-26T04:00:00.000Z"}, "index": 0},
      {"name": "MP1", "date": {"start": "2025-08-26T04:00:00.000Z", "end": "2025-10-31T04:00:00.000Z"}, "index": 1},
      {"name": "MP2 Interim", "date": {"start": "2025-09-29T04:00:00.000Z", "end": "2025-12-12T05:00:00.000Z"}, "index": 2},
      {"name": "MP2", "date": {"start": "2025-11-04T05:00:00.000Z", "end": "2026-01-23T05:00:00.000Z"}, "index": 3},
      {"name": "MP3 Interim", "date": {"start": "2025-12-15T05:00:00.000Z", "end": "2026-02-27T05:00:00.000Z"}, "index": 4},
      {"name": "MP3", "date": {"start": "2026-01-27T05:00:00.000Z", "end": "2026-04-14T04:00:00.000Z"}, "index": 5},
      {"name": "MP4 Interim", "date": {"start": "2026-03-02T05:00:00.000Z", "end": "2026-05-15T04:00:00.000Z"}, "index": 6},
      {"name": "MP4", "date": {"start": "2026-04-16T04:00:00.000Z", "end": "2026-06-17T04:00:00.000Z"}, "index": 7}
    ]
  },
  {
    "settings": {
      "default": {
        "rounding": {
          "percent": true,
          "percentPlaces": 2,
          "mark": false,
          "markPlaces": 0
        },
        "letterScale": [
          ["A", [89.5, 100]],
          ["B", [79.5, 89.49]],
          ["C", [69.5, 79.49]],
          ["D", [59.5, 69.49]],
          ["E", [0, 59.49]]
        ],
        "finals": {
          "show": false,
          "categories": [
            {"mp": 1, "courseIndex": null, "weight": 0.25, "type": "course"},
            {"mp": 3, "courseIndex": null, "weight": 0.25, "type": "course"},
            {"mp": 5, "courseIndex": null, "weight": 0.25, "type": "course"},
            {"mp": 7, "courseIndex": null, "weight": 0.25, "type": "course"}
          ],
          "semesters": [
            {
              "show": true,
              "categories": [
                {"mp": 1, "courseIndex": null, "weight": 0.5, "type": "course"},
                {"mp": 3, "courseIndex": null, "weight": 0.5, "type": "course"}
              ]
            },
            {
              "show": true,
              "categories": [
                {"mp": 5, "courseIndex": null, "weight": 0.5, "type": "course"},
                {"mp": 7, "courseIndex": null, "weight": 0.5, "type": "course"}
              ]
            }
          ]
        }
      },
      "mode": "other"
    },
    "gpa": 0,
    "wgpa": 0,
    "courses": [
      {
        "name": "Sample Course 1A",
        "period": 1,
        "layoutID": 0,
        "courseID": "COURSE001A",
        "room": "000",
        "settings": {
          "rounding": {
            "percent": true,
            "percentPlaces": 2,
            "mark": false,
            "markPlaces": 0
          },
          "letterScale": [
            ["A", [89.5, 100]],
            ["B", [79.5, 89.49]],
            ["C", [69.5, 79.49]],
            ["D", [59.5, 69.49]],
            ["E", [0, 59.49]]
          ],
          "finals": {
            "show": false,
            "categories": [
              {"mp": 1, "courseIndex": 0, "weight": 0.25, "type": "course"},
              {"mp": 3, "courseIndex": 0, "weight": 0.25, "type": "course"},
              {"mp": 5, "courseIndex": 0, "weight": 0.25, "type": "course"},
              {"mp": 7, "courseIndex": 0, "weight": 0.25, "type": "course"}
            ],
            "isSemester": false,
            "semesters": [
             
            ]
          }
        },
        "identifier": "COURSE001",
        "weighted": false,
        "grade": {
          "letter": "N/A",
          "raw": NaN,
          "color": "gray"
        },
        "teacher": {
          "name": "Teacher Name",
          "email": "teacher_email@placeholder.org"
        },
        "categories": [
          {
            "name": "Category 1",
            "weight": 0.9,
            "grade": {"letter": "N/A", "raw": NaN, "color": "gray"},
            "points": {"earned": 0, "possible": 0}
          },
          {
            "name": "Category 2",
            "weight": 0.1,
            "grade": {"letter": "N/A", "raw": NaN, "color": "gray"},
            "points": {"earned": 0, "possible": 0}
          }
        ],
        "assignments": []
      }
    ],
    "period": {
      "name": "MP2",
      "index": 3
    },
    "periods": [
      {"name": "MP1 Interim", "date": {"start": "2025-08-26T04:00:00.000Z", "end": "2025-09-26T04:00:00.000Z"}, "index": 0},
      {"name": "MP1", "date": {"start": "2025-08-26T04:00:00.000Z", "end": "2025-10-31T04:00:00.000Z"}, "index": 1},
      {"name": "MP2 Interim", "date": {"start": "2025-09-29T04:00:00.000Z", "end": "2025-12-12T05:00:00.000Z"}, "index": 2},
      {"name": "MP2", "date": {"start": "2025-11-04T05:00:00.000Z", "end": "2026-01-23T05:00:00.000Z"}, "index": 3},
      {"name": "MP3 Interim", "date": {"start": "2025-12-15T05:00:00.000Z", "end": "2026-02-27T05:00:00.000Z"}, "index": 4},
      {"name": "MP3", "date": {"start": "2026-01-27T05:00:00.000Z", "end": "2026-04-14T04:00:00.000Z"}, "index": 5},
      {"name": "MP4 Interim", "date": {"start": "2026-03-02T05:00:00.000Z", "end": "2026-05-15T04:00:00.000Z"}, "index": 6},
      {"name": "MP4", "date": {"start": "2026-04-16T04:00:00.000Z", "end": "2026-06-17T04:00:00.000Z"}, "index": 7}
    ]
  },
  {
    "settings": {
      "default": {
        "rounding": {
          "percent": true,
          "percentPlaces": 2,
          "mark": false,
          "markPlaces": 0
        },
        "letterScale": [
          ["A", [89.5, 100]],
          ["B", [79.5, 89.49]],
          ["C", [69.5, 79.49]],
          ["D", [59.5, 69.49]],
          ["E", [0, 59.49]]
        ],
        "finals": {
          "show": false,
          "categories": [
            {"mp": 1, "courseIndex": null, "weight": 0.25, "type": "course"},
            {"mp": 3, "courseIndex": null, "weight": 0.25, "type": "course"},
            {"mp": 5, "courseIndex": null, "weight": 0.25, "type": "course"},
            {"mp": 7, "courseIndex": null, "weight": 0.25, "type": "course"}
          ],
          "semesters": [
            {
              "show": true,
              "categories": [
                {"mp": 1, "courseIndex": null, "weight": 0.5, "type": "course"},
                {"mp": 3, "courseIndex": null, "weight": 0.5, "type": "course"}
              ]
            },
            {
              "show": true,
              "categories": [
                {"mp": 5, "courseIndex": null, "weight": 0.5, "type": "course"},
                {"mp": 7, "courseIndex": null, "weight": 0.5, "type": "course"}
              ]
            }
          ]
        }
      },
      "mode": "other"
    },
    "gpa": 0,
    "wgpa": 0,
    "courses": [
      {
        "name": "Sample Course 1A",
        "period": 1,
        "layoutID": 0,
        "courseID": "COURSE001A",
        "room": "000",
        "settings": {
          "rounding": {
            "percent": true,
            "percentPlaces": 2,
            "mark": false,
            "markPlaces": 0
          },
          "letterScale": [
            ["A", [89.5, 100]],
            ["B", [79.5, 89.49]],
            ["C", [69.5, 79.49]],
            ["D", [59.5, 69.49]],
            ["E", [0, 59.49]]
          ],
          "finals": {
            "show": false,
            "categories": [
              {"mp": 1, "courseIndex": 0, "weight": 0.25, "type": "course"},
              {"mp": 3, "courseIndex": 0, "weight": 0.25, "type": "course"},
              {"mp": 5, "courseIndex": 0, "weight": 0.25, "type": "course"},
              {"mp": 7, "courseIndex": 0, "weight": 0.25, "type": "course"}
            ],
            "isSemester": false,
            "semesters": [
             
            ]
          }
        },
        "identifier": "COURSE001",
        "weighted": false,
        "grade": {
          "letter": "N/A",
          "raw": NaN,
          "color": "gray"
        },
        "teacher": {
          "name": "Teacher Name",
          "email": "teacher_email@placeholder.org"
        },
        "categories": [
          {
            "name": "Category 1",
            "weight": 0.9,
            "grade": {"letter": "N/A", "raw": NaN, "color": "gray"},
            "points": {"earned": 0, "possible": 0}
          },
          {
            "name": "Category 2",
            "weight": 0.1,
            "grade": {"letter": "N/A", "raw": NaN, "color": "gray"},
            "points": {"earned": 0, "possible": 0}
          }
        ],
        "assignments": []
      }
    ],
    "period": {
      "name": "MP3 Interim",
      "index": 4
    },
    "periods": [
      {"name": "MP1 Interim", "date": {"start": "2025-08-26T04:00:00.000Z", "end": "2025-09-26T04:00:00.000Z"}, "index": 0},
      {"name": "MP1", "date": {"start": "2025-08-26T04:00:00.000Z", "end": "2025-10-31T04:00:00.000Z"}, "index": 1},
      {"name": "MP2 Interim", "date": {"start": "2025-09-29T04:00:00.000Z", "end": "2025-12-12T05:00:00.000Z"}, "index": 2},
      {"name": "MP2", "date": {"start": "2025-11-04T05:00:00.000Z", "end": "2026-01-23T05:00:00.000Z"}, "index": 3},
      {"name": "MP3 Interim", "date": {"start": "2025-12-15T05:00:00.000Z", "end": "2026-02-27T05:00:00.000Z"}, "index": 4},
      {"name": "MP3", "date": {"start": "2026-01-27T05:00:00.000Z", "end": "2026-04-14T04:00:00.000Z"}, "index": 5},
      {"name": "MP4 Interim", "date": {"start": "2026-03-02T05:00:00.000Z", "end": "2026-05-15T04:00:00.000Z"}, "index": 6},
      {"name": "MP4", "date": {"start": "2026-04-16T04:00:00.000Z", "end": "2026-06-17T04:00:00.000Z"}, "index": 7}
    ]
  },
  {
    "settings": {
      "default": {
        "rounding": {
          "percent": true,
          "percentPlaces": 2,
          "mark": false,
          "markPlaces": 0
        },
        "letterScale": [
          ["A", [89.5, 100]],
          ["B", [79.5, 89.49]],
          ["C", [69.5, 79.49]],
          ["D", [59.5, 69.49]],
          ["E", [0, 59.49]]
        ],
        "finals": {
          "show": false,
          "categories": [
            {"mp": 1, "courseIndex": null, "weight": 0.25, "type": "course"},
            {"mp": 3, "courseIndex": null, "weight": 0.25, "type": "course"},
            {"mp": 5, "courseIndex": null, "weight": 0.25, "type": "course"},
            {"mp": 7, "courseIndex": null, "weight": 0.25, "type": "course"}
          ],
          "semesters": [
            {
              "show": true,
              "categories": [
                {"mp": 1, "courseIndex": null, "weight": 0.5, "type": "course"},
                {"mp": 3, "courseIndex": null, "weight": 0.5, "type": "course"}
              ]
            },
            {
              "show": true,
              "categories": [
                {"mp": 5, "courseIndex": null, "weight": 0.5, "type": "course"},
                {"mp": 7, "courseIndex": null, "weight": 0.5, "type": "course"}
              ]
            }
          ]
        }
      },
      "mode": "other"
    },
    "gpa": 0,
    "wgpa": 0,
    "courses": [
      {
        "name": "Sample Course 1B",
        "period": 1,
        "layoutID": 0,
        "courseID": "COURSE001B",
        "room": "000",
        "settings": {
          "rounding": {
            "percent": true,
            "percentPlaces": 2,
            "mark": false,
            "markPlaces": 0
          },
          "letterScale": [
            ["A", [89.5, 100]],
            ["B", [79.5, 89.49]],
            ["C", [69.5, 79.49]],
            ["D", [59.5, 69.49]],
            ["E", [0, 59.49]]
          ],
          "finals": {
            "show": false,
            "categories": [
              {"mp": 1, "courseIndex": 0, "weight": 0.25, "type": "course"},
              {"mp": 3, "courseIndex": 0, "weight": 0.25, "type": "course"},
              {"mp": 5, "courseIndex": 0, "weight": 0.25, "type": "course"},
              {"mp": 7, "courseIndex": 0, "weight": 0.25, "type": "course"}
            ],
            "isSemester": false,
            "semesters": [
             
            ]
          }
        },
        "identifier": "COURSE001",
        "weighted": false,
        "grade": {
          "letter": "N/A",
          "raw": NaN,
          "color": "gray"
        },
        "teacher": {
          "name": "Teacher Name",
          "email": "teacher_email@placeholder.org"
        },
        "categories": [
          {
            "name": "Category 1",
            "weight": 0.9,
            "grade": {"letter": "N/A", "raw": NaN, "color": "gray"},
            "points": {"earned": 0, "possible": 0}
          },
          {
            "name": "Category 2",
            "weight": 0.1,
            "grade": {"letter": "N/A", "raw": NaN, "color": "gray"},
            "points": {"earned": 0, "possible": 0}
          }
        ],
        "assignments": []
      }
    ],
    "period": {
      "name": "MP3",
      "index": 5
    },
    "periods": [
      {"name": "MP1 Interim", "date": {"start": "2025-08-26T04:00:00.000Z", "end": "2025-09-26T04:00:00.000Z"}, "index": 0},
      {"name": "MP1", "date": {"start": "2025-08-26T04:00:00.000Z", "end": "2025-10-31T04:00:00.000Z"}, "index": 1},
      {"name": "MP2 Interim", "date": {"start": "2025-09-29T04:00:00.000Z", "end": "2025-12-12T05:00:00.000Z"}, "index": 2},
      {"name": "MP2", "date": {"start": "2025-11-04T05:00:00.000Z", "end": "2026-01-23T05:00:00.000Z"}, "index": 3},
      {"name": "MP3 Interim", "date": {"start": "2025-12-15T05:00:00.000Z", "end": "2026-02-27T05:00:00.000Z"}, "index": 4},
      {"name": "MP3", "date": {"start": "2026-01-27T05:00:00.000Z", "end": "2026-04-14T04:00:00.000Z"}, "index": 5},
      {"name": "MP4 Interim", "date": {"start": "2026-03-02T05:00:00.000Z", "end": "2026-05-15T04:00:00.000Z"}, "index": 6},
      {"name": "MP4", "date": {"start": "2026-04-16T04:00:00.000Z", "end": "2026-06-17T04:00:00.000Z"}, "index": 7}
    ]
  },
  {
    "settings": {
      "default": {
        "rounding": {
          "percent": true,
          "percentPlaces": 2,
          "mark": false,
          "markPlaces": 0
        },
        "letterScale": [
          ["A", [89.5, 100]],
          ["B", [79.5, 89.49]],
          ["C", [69.5, 79.49]],
          ["D", [59.5, 69.49]],
          ["E", [0, 59.49]]
        ],
        "finals": {
          "show": false,
          "categories": [
            {"mp": 1, "courseIndex": null, "weight": 0.25, "type": "course"},
            {"mp": 3, "courseIndex": null, "weight": 0.25, "type": "course"},
            {"mp": 5, "courseIndex": null, "weight": 0.25, "type": "course"},
            {"mp": 7, "courseIndex": null, "weight": 0.25, "type": "course"}
          ],
          "semesters": [
            {
              "show": true,
              "categories": [
                {"mp": 1, "courseIndex": null, "weight": 0.5, "type": "course"},
                {"mp": 3, "courseIndex": null, "weight": 0.5, "type": "course"}
              ]
            },
            {
              "show": true,
              "categories": [
                {"mp": 5, "courseIndex": null, "weight": 0.5, "type": "course"},
                {"mp": 7, "courseIndex": null, "weight": 0.5, "type": "course"}
              ]
            }
          ]
        }
      },
      "mode": "other"
    },
    "gpa": 0,
    "wgpa": 0,
    "courses": [
      {
        "name": "Sample Course 1B",
        "period": 1,
        "layoutID": 0,
        "courseID": "COURSE001B",
        "room": "000",
        "settings": {
          "rounding": {
            "percent": true,
            "percentPlaces": 2,
            "mark": false,
            "markPlaces": 0
          },
          "letterScale": [
            ["A", [89.5, 100]],
            ["B", [79.5, 89.49]],
            ["C", [69.5, 79.49]],
            ["D", [59.5, 69.49]],
            ["E", [0, 59.49]]
          ],
          "finals": {
            "show": false,
            "categories": [
              {"mp": 1, "courseIndex": 0, "weight": 0.25, "type": "course"},
              {"mp": 3, "courseIndex": 0, "weight": 0.25, "type": "course"},
              {"mp": 5, "courseIndex": 0, "weight": 0.25, "type": "course"},
              {"mp": 7, "courseIndex": 0, "weight": 0.25, "type": "course"}
            ],
            "isSemester": false,
            "semesters": [
             
            ]
          }
        },
        "identifier": "COURSE001",
        "weighted": false,
        "grade": {
          "letter": "N/A",
          "raw": NaN,
          "color": "gray"
        },
        "teacher": {
          "name": "Teacher Name",
          "email": "teacher_email@placeholder.org"
        },
        "categories": [
          {
            "name": "Category 1",
            "weight": 0.9,
            "grade": {"letter": "N/A", "raw": NaN, "color": "gray"},
            "points": {"earned": 0, "possible": 0}
          },
          {
            "name": "Category 2",
            "weight": 0.1,
            "grade": {"letter": "N/A", "raw": NaN, "color": "gray"},
            "points": {"earned": 0, "possible": 0}
          }
        ],
        "assignments": []
      }
    ],
    "period": {
      "name": "MP4 Interim",
      "index": 6
    },
    "periods": [
      {"name": "MP1 Interim", "date": {"start": "2025-08-26T04:00:00.000Z", "end": "2025-09-26T04:00:00.000Z"}, "index": 0},
      {"name": "MP1", "date": {"start": "2025-08-26T04:00:00.000Z", "end": "2025-10-31T04:00:00.000Z"}, "index": 1},
      {"name": "MP2 Interim", "date": {"start": "2025-09-29T04:00:00.000Z", "end": "2025-12-12T05:00:00.000Z"}, "index": 2},
      {"name": "MP2", "date": {"start": "2025-11-04T05:00:00.000Z", "end": "2026-01-23T05:00:00.000Z"}, "index": 3},
      {"name": "MP3 Interim", "date": {"start": "2025-12-15T05:00:00.000Z", "end": "2026-02-27T05:00:00.000Z"}, "index": 4},
      {"name": "MP3", "date": {"start": "2026-01-27T05:00:00.000Z", "end": "2026-04-14T04:00:00.000Z"}, "index": 5},
      {"name": "MP4 Interim", "date": {"start": "2026-03-02T05:00:00.000Z", "end": "2026-05-15T04:00:00.000Z"}, "index": 6},
      {"name": "MP4", "date": {"start": "2026-04-16T04:00:00.000Z", "end": "2026-06-17T04:00:00.000Z"}, "index": 7}
    ]
  },
  {
    "settings": {
      "default": {
        "rounding": {
          "percent": true,
          "percentPlaces": 2,
          "mark": false,
          "markPlaces": 0
        },
        "letterScale": [
          ["A", [89.5, 100]],
          ["B", [79.5, 89.49]],
          ["C", [69.5, 79.49]],
          ["D", [59.5, 69.49]],
          ["E", [0, 59.49]]
        ],
        "finals": {
          "show": false,
          "categories": [
            {"mp": 1, "courseIndex": null, "weight": 0.25, "type": "course"},
            {"mp": 3, "courseIndex": null, "weight": 0.25, "type": "course"},
            {"mp": 5, "courseIndex": null, "weight": 0.25, "type": "course"},
            {"mp": 7, "courseIndex": null, "weight": 0.25, "type": "course"}
          ],
          "semesters": [
            {
              "show": true,
              "categories": [
                {"mp": 1, "courseIndex": null, "weight": 0.5, "type": "course"},
                {"mp": 3, "courseIndex": null, "weight": 0.5, "type": "course"}
              ]
            },
            {
              "show": true,
              "categories": [
                {"mp": 5, "courseIndex": null, "weight": 0.5, "type": "course"},
                {"mp": 7, "courseIndex": null, "weight": 0.5, "type": "course"}
              ]
            }
          ]
        }
      },
      "mode": "other"
    },
    "gpa": 0,
    "wgpa": 0,
    "courses": [
      {
        "name": "Sample Course 1B",
        "period": 1,
        "layoutID": 0,
        "courseID": "COURSE001B",
        "room": "000",
        "settings": {
          "rounding": {
            "percent": true,
            "percentPlaces": 2,
            "mark": false,
            "markPlaces": 0
          },
          "letterScale": [
            ["A", [89.5, 100]],
            ["B", [79.5, 89.49]],
            ["C", [69.5, 79.49]],
            ["D", [59.5, 69.49]],
            ["E", [0, 59.49]]
          ],
          "finals": {
            "show": false,
            "categories": [
              {"mp": 1, "courseIndex": 0, "weight": 0.25, "type": "course"},
              {"mp": 3, "courseIndex": 0, "weight": 0.25, "type": "course"},
              {"mp": 5, "courseIndex": 0, "weight": 0.25, "type": "course"},
              {"mp": 7, "courseIndex": 0, "weight": 0.25, "type": "course"}
            ],
            "isSemester": false,
            "semesters": [
             
            ]
          }
        },
        "identifier": "COURSE001",
        "weighted": false,
        "grade": {
          "letter": "N/A",
          "raw": NaN,
          "color": "gray"
        },
        "teacher": {
          "name": "Teacher Name",
          "email": "teacher_email@placeholder.org"
        },
        "categories": [
          {
            "name": "Category 1",
            "weight": 0.9,
            "grade": {"letter": "N/A", "raw": NaN, "color": "gray"},
            "points": {"earned": 0, "possible": 0}
          },
          {
            "name": "Category 2",
            "weight": 0.1,
            "grade": {"letter": "N/A", "raw": NaN, "color": "gray"},
            "points": {"earned": 0, "possible": 0}
          }
        ],
        "assignments": []
      }
    ],
    "period": {
      "name": "MP4",
      "index": 7
    },
    "periods": [
      {"name": "MP1 Interim", "date": {"start": "2025-08-26T04:00:00.000Z", "end": "2025-09-26T04:00:00.000Z"}, "index": 0},
      {"name": "MP1", "date": {"start": "2025-08-26T04:00:00.000Z", "end": "2025-10-31T04:00:00.000Z"}, "index": 1},
      {"name": "MP2 Interim", "date": {"start": "2025-09-29T04:00:00.000Z", "end": "2025-12-12T05:00:00.000Z"}, "index": 2},
      {"name": "MP2", "date": {"start": "2025-11-04T05:00:00.000Z", "end": "2026-01-23T05:00:00.000Z"}, "index": 3},
      {"name": "MP3 Interim", "date": {"start": "2025-12-15T05:00:00.000Z", "end": "2026-02-27T05:00:00.000Z"}, "index": 4},
      {"name": "MP3", "date": {"start": "2026-01-27T05:00:00.000Z", "end": "2026-04-14T04:00:00.000Z"}, "index": 5},
      {"name": "MP4 Interim", "date": {"start": "2026-03-02T05:00:00.000Z", "end": "2026-05-15T04:00:00.000Z"}, "index": 6},
      {"name": "MP4", "date": {"start": "2026-04-16T04:00:00.000Z", "end": "2026-06-17T04:00:00.000Z"}, "index": 7}
    ]
  },
  {
    "settings": {
      "default": {
        "rounding": {
          "percent": true,
          "percentPlaces": 2,
          "mark": false,
          "markPlaces": 0
        },
        "letterScale": [
          ["A", [89.5, 100]],
          ["B", [79.5, 89.49]],
          ["C", [69.5, 79.49]],
          ["D", [59.5, 69.49]],
          ["E", [0, 59.49]]
        ],
        "finals": {
          "show": false,
          "categories": [
            {"mp": 1, "courseIndex": null, "weight": 0.25, "type": "course"},
            {"mp": 3, "courseIndex": null, "weight": 0.25, "type": "course"},
            {"mp": 5, "courseIndex": null, "weight": 0.25, "type": "course"},
            {"mp": 7, "courseIndex": null, "weight": 0.25, "type": "course"}
          ],
          "semesters": [
            {
              "show": true,
              "categories": [
                {"mp": 1, "courseIndex": null, "weight": 0.5, "type": "course"},
                {"mp": 3, "courseIndex": null, "weight": 0.5, "type": "course"}
              ]
            },
            {
              "show": true,
              "categories": [
                {"mp": 5, "courseIndex": null, "weight": 0.5, "type": "course"},
                {"mp": 7, "courseIndex": null, "weight": 0.5, "type": "course"}
              ]
            }
          ]
        }
      },
      "mode": "other"
    },
    "gpa": 0,
    "wgpa": 0,
    "courses": [
      {
        "name": "Sample Course 1B",
        "period": 1,
        "layoutID": 0,
        "courseID": "COURSE001B",
        "room": "000",
        "settings": {
          "rounding": {
            "percent": true,
            "percentPlaces": 2,
            "mark": false,
            "markPlaces": 0
          },
          "letterScale": [
            ["A", [89.5, 100]],
            ["B", [79.5, 89.49]],
            ["C", [69.5, 79.49]],
            ["D", [59.5, 69.49]],
            ["E", [0, 59.49]]
          ],
          "finals": {
            "show": false,
            "categories": [
              {"mp": 1, "courseIndex": 0, "weight": 0.25, "type": "course"},
              {"mp": 3, "courseIndex": 0, "weight": 0.25, "type": "course"},
              {"mp": 5, "courseIndex": 0, "weight": 0.25, "type": "course"},
              {"mp": 7, "courseIndex": 0, "weight": 0.25, "type": "course"}
            ],
            "isSemester": false,
            "semesters": [
             
            ]
          }
        },
        "identifier": "COURSE001",
        "weighted": false,
        "grade": {
          "letter": "N/A",
          "raw": NaN,
          "color": "gray"
        },
        "teacher": {
          "name": "Teacher Name",
          "email": "teacher_email@placeholder.org"
        },
        "categories": [
          {
            "name": "Category 1",
            "weight": 0.9,
            "grade": {"letter": "N/A", "raw": NaN, "color": "gray"},
            "points": {"earned": 0, "possible": 0}
          },
          {
            "name": "Category 2",
            "weight": 0.1,
            "grade": {"letter": "N/A", "raw": NaN, "color": "gray"},
            "points": {"earned": 0, "possible": 0}
          }
        ],
        "assignments": []
      }
    ],
    "period": {
      "name": "MP1 Interim",
      "index": 0
    },
    "periods": [
      {"name": "MP1 Interim", "date": {"start": "2025-08-26T04:00:00.000Z", "end": "2025-09-26T04:00:00.000Z"}, "index": 0},
      {"name": "MP1", "date": {"start": "2025-08-26T04:00:00.000Z", "end": "2025-10-31T04:00:00.000Z"}, "index": 1},
      {"name": "MP2 Interim", "date": {"start": "2025-09-29T04:00:00.000Z", "end": "2025-12-12T05:00:00.000Z"}, "index": 2},
      {"name": "MP2", "date": {"start": "2025-11-04T05:00:00.000Z", "end": "2026-01-23T05:00:00.000Z"}, "index": 3},
      {"name": "MP3 Interim", "date": {"start": "2025-12-15T05:00:00.000Z", "end": "2026-02-27T05:00:00.000Z"}, "index": 4},
      {"name": "MP3", "date": {"start": "2026-01-27T05:00:00.000Z", "end": "2026-04-14T04:00:00.000Z"}, "index": 5},
      {"name": "MP4 Interim", "date": {"start": "2026-03-02T05:00:00.000Z", "end": "2026-05-15T04:00:00.000Z"}, "index": 6},
      {"name": "MP4", "date": {"start": "2026-04-16T04:00:00.000Z", "end": "2026-06-17T04:00:00.000Z"}, "index": 7}
    ]
  }
] as any)


const document=`JVBERi0xLjAKMSAwIG9iajw8L1R5cGUvQ2F0YWxvZy9QYWdlcyAyIDAgUj4+ZW5kb2JqCjIgMCBvYmo8PC9UeXBlL1BhZ2VzL0tpZHNbMyAwIFJdL0NvdW50IDE+PmVuZG9iagozIDAgb2JqPDwvVHlwZS9QYWdlL1BhcmVudCAyIDAgUi9SZXNvdXJjZXM8PD4+L01lZGlhQm94WzAgMCA5IDldPj5lbmRvYmoKeHJlZgowIDQKMDAwMDAwMDAwMCA2NTUzNSBmIAowMDAwMDAwMDA5IDAwMDAwIG4gCjAwMDAwMDAwNTIgMDAwMDAgbiAKMDAwMDAwMDEwMSAwMDAwMCBuIAp0cmFpbGVyPDwvUm9vdCAxIDAgUi9TaXplIDQ+PgpzdGFydHhyZWYKMTc0CiUlRU9G`

const studentInfo={
  "student": {
    "name": [
      "Student Name"
    ],
    "lastName": "not available",
    "nickname": "not available"
  },
  "photo": "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",
  "currentSchool": "Sample High School",
  "id": "000000",
  "orgYearGu": "00000000-0000-0000-0000-000000000000",
  "gender": "null",
  "grade": "12"
}

const schedule={
  "termName": "Semester 1",
  "termIndex": "0",
  "terms": [
    {
      "start": "08/26/2025",
      "end": "01/23/2026",
      "termIndex": "0",
      "termName": "Semester 1"
    },
    {
      "start": "01/27/2026",
      "end": "06/17/2026",
      "termIndex": "1",
      "termName": "Semester 2"
    }
  ],
  "mainClasses": [
    {
      "name": "(99) - Homeroom",
      "period": "0",
      "teacher": "Teacher Name",
      "room": "000"
    },
    {
      "name": "(0) - Sample Course 1A",
      "period": "1",
      "teacher": "Teacher Name",
      "room": "000"
    },
    {
      "name": "(3) - Sample Course 2A",
      "period": "2",
      "teacher": "Teacher Name",
      "room": "000"
    },
    {
      "name": "(2) - Sample Course 3A",
      "period": "3",
      "teacher": "Teacher Name",
      "room": "000"
    },
    {
      "name": "(3) - Sample Course 4A",
      "period": "4",
      "teacher": "Teacher Name",
      "room": "000"
    },
    {
      "name": "(0) - Sample Course 5",
      "period": "5",
      "teacher": "Teacher Name",
      "room": "000"
    },
    {
      "name": "(99) - Lunch",
      "period": "6",
      "teacher": "Teacher Name",
      "room": "CAFE"
    },
    {
      "name": "(3) - Sample Course 6A",
      "period": "7",
      "teacher": "Teacher Name",
      "room": "000"
    },
    {
      "name": "(2) - Sample Course 7A",
      "period": "8",
      "teacher": "Teacher Name",
      "room": "000"
    }
  ],
  "today": {
    "main": [
      {
        "name": ["COURSE000 Homeroom - COURSE000-00000"],
        "start": ["12:00 AM"],
        "end": ["12:00 AM"],
        "teacher": ["Name, Teacher"],
        "period": ["00"],
        "room": ["000"]
      },
      {
        "name": ["COURSE001A Sample Course 1A - COURSE001A-0001"],
        "start": ["7:45 AM"],
        "end": ["8:30 AM"],
        "teacher": ["Name, Teacher"],
        "period": ["01"],
        "room": ["000"]
      },
      {
        "name": ["COURSE002A Sample Course 2A - COURSE002A-0002"],
        "start": ["8:35 AM"],
        "end": ["9:25 AM"],
        "teacher": ["Name, Teacher"],
        "period": ["02"],
        "room": ["000"]
      },
      {
        "name": ["COURSE003A Sample Course 3A - COURSE003A-0003"],
        "start": ["9:30 AM"],
        "end": ["10:15 AM"],
        "teacher": ["Name, Teacher"],
        "period": ["03"],
        "room": ["000"]
      },
      {
        "name": ["COURSE004A Sample Course 4A - COURSE004A-0004"],
        "start": ["10:20 AM"],
        "end": ["11:05 AM"],
        "teacher": ["Name, Teacher"],
        "period": ["04"],
        "room": ["000"]
      },
      {
        "name": ["COURSE005 Sample Course 5 - COURSE005-0005"],
        "start": ["11:10 AM"],
        "end": ["11:55 AM"],
        "teacher": ["Name, Teacher"],
        "period": ["05"],
        "room": ["000"]
      },
      {
        "name": ["COURSE006 Lunch - COURSE006-0006"],
        "start": ["11:55 AM"],
        "end": ["12:50 PM"],
        "teacher": ["Name, Teacher"],
        "period": ["06"],
        "room": ["CAFE"]
      },
      {
        "name": ["COURSE007A Sample Course 6A - COURSE007A-0007"],
        "start": ["12:55 PM"],
        "end": ["1:40 PM"],
        "teacher": ["Name, Teacher"],
        "period": ["07"],
        "room": ["000"]
      },
      {
        "name": ["COURSE008A Sample Course 7A - COURSE008A-0008"],
        "start": ["1:45 PM"],
        "end": ["2:30 PM"],
        "teacher": ["Name, Teacher"],
        "period": ["08"],
        "room": ["000"]
      }
    ]
  }
}


const attendance=[{
  type: "okay",
  periodInfos: [
    { period: 1, total: { "Absent": 1, "Tardy": 2 } },
    { period: 2, total: { "Excused": 1 } },
    { period: 3, total: {} },
    { period: 4, total: { "Tardy": 1 } },
    { period: 5, total: {} },
    { period: 6, total: {} },
    { period: 7, total: { "Absent": 1 } },
    { period: 8, total: {} }
  ],
  absences: [
    {
      date: new Date("2025-09-15T04:00:00.000Z"),
      periods: [
        { name: "Absent", period: 1 },
        { name: "Tardy", period: 4 }
      ]
    },
    {
      date: new Date("2025-09-22T04:00:00.000Z"),
      periods: [
        { name: "Excused", period: 2 },
        { name: "Tardy", period: 1 }
      ]
    }
  ]
},{
  labels: ["1", "2", "4", "7"],
  datasets: [
    {
      label: "Absent",
      borderWidth: 1,
      backgroundColor: "#FF7F7F",
      data: { "1": 1, "2": 0, "4": 0, "7": 1 }
    },
    {
      label: "Tardy",
      borderWidth: 1,
      backgroundColor: "#FA8A20",
      data: { "1": 1, "2": 0, "4": 1, "7": 0 }
    },
    {
      label: "Excused",
      borderWidth: 1,
      backgroundColor: "#FFEC1F",
      data: { "1": 0, "2": 1, "4": 0, "7": 0 }
    }
  ]
}]

export{grades,studentInfo,document,schedule,attendance}

export type {Cache}