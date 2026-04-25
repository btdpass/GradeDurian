interface CourseHistory{
  "Grade":string,
  "GradeLevelOrder":number,
  "Terms":Term[]
}


interface Term{
  "SchoolName":string,
  "Year":string,
  "TermName":string,
  "TermOrder":number,
  "Courses":Course[]

}


interface Course{
  "CourseID":string,
  "CourseTitle":string,
  "CreditsAttempted":string,
  "CreditsCompleted":string,
  "VerifiedCredit":string,
  "Mark":string,
  "CHSType":string

}

interface ParsedCourse{
  "CourseID":string,
  "CourseTitle":string,
  "CreditsAttempted":number,
  "CreditsCompleted":number,
  "VerifiedCredit":string,
  "Mark":string,
  "CHSType":string

}



interface ParsedTerm{
  "SchoolName":string,
  "Year":string,
  "TermName":string,
  "TermOrder":number,
  "Courses":ParsedCourse[]

}


interface History{
  "Grade":string,
  "GradeLevelOrder":string,
  "Terms":ParsedTerm[]
}





function parseCourseHistory(ch:CourseHistory[]){

}






const courseHistory:CourseHistory[] = [
  {
    "Grade": "11",
    "GradeLevelOrder": 13,
    "Terms": [
      {
        "SchoolName": "High School Summer Program",
        "Year": "2024",
        "TermName": "SS2",
        "TermOrder": 45,
        "Courses": [
          {
            "CourseID": "MAT2048B",
            "CourseTitle": "Hon Precalculus B",
            "CreditsAttempted": "0.50",
            "CreditsCompleted": "0.50",
            "VerifiedCredit": "",
            "Mark": "A",
            "CHSType": "High School"
          }
        ]
      },
      {
        "SchoolName": "High School Summer Program",
        "Year": "2024",
        "TermName": "SS1",
        "TermOrder": 45,
        "Courses": [
          {
            "CourseID": "MAT2048A",
            "CourseTitle": "Hon Precalculus A",
            "CreditsAttempted": "0.50",
            "CreditsCompleted": "0.50",
            "VerifiedCredit": "",
            "Mark": "A",
            "CHSType": "High School"
          }
        ]
      },
      {
        "SchoolName": "Walt Whitman High",
        "Year": "2025",
        "TermName": "S2",
        "TermOrder": 25,
        "Courses": [
          {
            "CourseID": "MAT2040B",
            "CourseTitle": "AP AB Calculus B",
            "CreditsAttempted": "0.50",
            "CreditsCompleted": "0.50",
            "VerifiedCredit": "",
            "Mark": "A",
            "CHSType": "High School"
          },
          {
            "CourseID": "SCI2059B",
            "CourseTitle": "AP Chemistry B DP",
            "CreditsAttempted": "1.00",
            "CreditsCompleted": "1.00",
            "VerifiedCredit": "",
            "Mark": "B",
            "CHSType": "High School"
          },
          {
            "CourseID": "ENG2031B",
            "CourseTitle": "AP Language and Comp B",
            "CreditsAttempted": "0.50",
            "CreditsCompleted": "0.50",
            "VerifiedCredit": "",
            "Mark": "A",
            "CHSType": "High School"
          },
          {
            "CourseID": "SOC2069B",
            "CourseTitle": "AP Psychology B",
            "CreditsAttempted": "0.50",
            "CreditsCompleted": "0.50",
            "VerifiedCredit": "",
            "Mark": "A",
            "CHSType": "High School"
          },
          {
            "CourseID": "SOC2056",
            "CourseTitle": "Sociology 2",
            "CreditsAttempted": "0.50",
            "CreditsCompleted": "0.50",
            "VerifiedCredit": "",
            "Mark": "A",
            "CHSType": "High School"
          },
          {
            "CourseID": "WLG2135B",
            "CourseTitle": "Spanish 5B",
            "CreditsAttempted": "0.50",
            "CreditsCompleted": "0.50",
            "VerifiedCredit": "",
            "Mark": "B",
            "CHSType": "High School"
          }
        ]
      },
      {
        "SchoolName": "Walt Whitman High",
        "Year": "2025",
        "TermName": "S1",
        "TermOrder": 20,
        "Courses": [
          {
            "CourseID": "MAT2040A",
            "CourseTitle": "AP AB Calculus A",
            "CreditsAttempted": "0.50",
            "CreditsCompleted": "0.50",
            "VerifiedCredit": "",
            "Mark": "A",
            "CHSType": "High School"
          },
          {
            "CourseID": "SCI2059A",
            "CourseTitle": "AP Chemistry A DP",
            "CreditsAttempted": "1.00",
            "CreditsCompleted": "1.00",
            "VerifiedCredit": "",
            "Mark": "B",
            "CHSType": "High School"
          },
          {
            "CourseID": "ENG2031A",
            "CourseTitle": "AP Language and Comp A",
            "CreditsAttempted": "0.50",
            "CreditsCompleted": "0.50",
            "VerifiedCredit": "",
            "Mark": "A",
            "CHSType": "High School"
          },
          {
            "CourseID": "SOC2069A",
            "CourseTitle": "AP Psychology A",
            "CreditsAttempted": "0.50",
            "CreditsCompleted": "0.50",
            "VerifiedCredit": "",
            "Mark": "A",
            "CHSType": "High School"
          },
          {
            "CourseID": "ART2088A",
            "CourseTitle": "Chorus HS 2A",
            "CreditsAttempted": "0.50",
            "CreditsCompleted": "0.50",
            "VerifiedCredit": "",
            "Mark": "A",
            "CHSType": "High School"
          },
          {
            "CourseID": "WLG2135A",
            "CourseTitle": "Spanish 5A",
            "CreditsAttempted": "0.50",
            "CreditsCompleted": "0.50",
            "VerifiedCredit": "",
            "Mark": "A",
            "CHSType": "High School"
          }
        ]
      }
    ]
  },
  {
    "Grade": "10",
    "GradeLevelOrder": 12,
    "Terms": [
      {
        "SchoolName": "Student Online Learning",
        "Year": "2023",
        "TermName": "SS1",
        "TermOrder": 45,
        "Courses": [
          {
            "CourseID": "MAT2012A",
            "CourseTitle": "Hon Algebra 2A",
            "CreditsAttempted": "0.50",
            "CreditsCompleted": "0.50",
            "VerifiedCredit": "",
            "Mark": "A",
            "CHSType": "High School"
          }
        ]
      },
      {
        "SchoolName": "Walt Whitman High",
        "Year": "2024",
        "TermName": "S2",
        "TermOrder": 25,
        "Courses": [
          {
            "CourseID": "SOC2064",
            "CourseTitle": "AP Macroeconomics",
            "CreditsAttempted": "0.50",
            "CreditsCompleted": "0.50",
            "VerifiedCredit": "",
            "Mark": "A",
            "CHSType": "High School"
          },
          {
            "CourseID": "SOC2022B",
            "CourseTitle": "AP US History B",
            "CreditsAttempted": "0.50",
            "CreditsCompleted": "0.50",
            "VerifiedCredit": "",
            "Mark": "A",
            "CHSType": "High School"
          },
          {
            "CourseID": "ART2088B",
            "CourseTitle": "Chorus HS 2B",
            "CreditsAttempted": "0.50",
            "CreditsCompleted": "0.50",
            "VerifiedCredit": "",
            "Mark": "A",
            "CHSType": "High School"
          },
          {
            "CourseID": "SCI2004B",
            "CourseTitle": "Hon Chemistry B",
            "CreditsAttempted": "0.50",
            "CreditsCompleted": "0.50",
            "VerifiedCredit": "",
            "Mark": "A",
            "CHSType": "High School"
          },
          {
            "CourseID": "ENG2003B",
            "CourseTitle": "Hon English 10B",
            "CreditsAttempted": "0.50",
            "CreditsCompleted": "0.50",
            "VerifiedCredit": "",
            "Mark": "A",
            "CHSType": "High School"
          },
          {
            "CourseID": "MAT2048B",
            "CourseTitle": "Hon Precalculus B",
            "CreditsAttempted": "0.50",
            "CreditsCompleted": "0.50",
            "VerifiedCredit": "",
            "Mark": "B",
            "CHSType": "Mark Exclusion - Higher Grade"
          },
          {
            "CourseID": "WLG2139B",
            "CourseTitle": "Hon Spanish 4B",
            "CreditsAttempted": "0.50",
            "CreditsCompleted": "0.50",
            "VerifiedCredit": "",
            "Mark": "A",
            "CHSType": "High School"
          }
        ]
      },
      {
        "SchoolName": "Walt Whitman High",
        "Year": "2024",
        "TermName": "S1",
        "TermOrder": 20,
        "Courses": [
          {
            "CourseID": "SOC2065",
            "CourseTitle": "AP Microeconomics",
            "CreditsAttempted": "0.50",
            "CreditsCompleted": "0.50",
            "VerifiedCredit": "",
            "Mark": "A",
            "CHSType": "High School"
          },
          {
            "CourseID": "SOC2022A",
            "CourseTitle": "AP US History A",
            "CreditsAttempted": "0.50",
            "CreditsCompleted": "0.50",
            "VerifiedCredit": "",
            "Mark": "B",
            "CHSType": "High School"
          },
          {
            "CourseID": "ART2088A",
            "CourseTitle": "Chorus HS 2A",
            "CreditsAttempted": "0.50",
            "CreditsCompleted": "0.50",
            "VerifiedCredit": "",
            "Mark": "A",
            "CHSType": "High School"
          },
          {
            "CourseID": "SCI2004A",
            "CourseTitle": "Hon Chemistry A",
            "CreditsAttempted": "0.50",
            "CreditsCompleted": "0.50",
            "VerifiedCredit": "",
            "Mark": "A",
            "CHSType": "High School"
          },
          {
            "CourseID": "ENG2003A",
            "CourseTitle": "Hon English 10A",
            "CreditsAttempted": "0.50",
            "CreditsCompleted": "0.50",
            "VerifiedCredit": "",
            "Mark": "A",
            "CHSType": "High School"
          },
          {
            "CourseID": "MAT2048A",
            "CourseTitle": "Hon Precalculus A",
            "CreditsAttempted": "0.50",
            "CreditsCompleted": "0.50",
            "VerifiedCredit": "",
            "Mark": "B",
            "CHSType": "Mark Exclusion - Higher Grade"
          },
          {
            "CourseID": "WLG2139A",
            "CourseTitle": "Hon Spanish 4A",
            "CreditsAttempted": "0.50",
            "CreditsCompleted": "0.50",
            "VerifiedCredit": "",
            "Mark": "A",
            "CHSType": "High School"
          }
        ]
      }
    ]
  },
  {
    "Grade": "09",
    "GradeLevelOrder": 11,
    "Terms": [
      {
        "SchoolName": "Walt Whitman High",
        "Year": "2023",
        "TermName": "S2",
        "TermOrder": 25,
        "Courses": [
          {
            "CourseID": "SOC2021B",
            "CourseTitle": "AP GovPolitics US NSL B",
            "CreditsAttempted": "0.50",
            "CreditsCompleted": "0.50",
            "VerifiedCredit": "",
            "Mark": "A",
            "CHSType": "High School"
          },
          {
            "CourseID": "ART2087B",
            "CourseTitle": "Chorus HS 1B",
            "CreditsAttempted": "0.50",
            "CreditsCompleted": "0.50",
            "VerifiedCredit": "",
            "Mark": "A",
            "CHSType": "High School"
          },
          {
            "CourseID": "HPE2011",
            "CourseTitle": "CPE Net Sports",
            "CreditsAttempted": "0.50",
            "CreditsCompleted": "0.50",
            "VerifiedCredit": "",
            "Mark": "A",
            "CHSType": "High School"
          },
          {
            "CourseID": "MAT2012B",
            "CourseTitle": "Hon Algebra 2B",
            "CreditsAttempted": "0.50",
            "CreditsCompleted": "0.50",
            "VerifiedCredit": "",
            "Mark": "B",
            "CHSType": "High School"
          },
          {
            "CourseID": "SCI2001B",
            "CourseTitle": "Hon Biology B",
            "CreditsAttempted": "0.50",
            "CreditsCompleted": "0.50",
            "VerifiedCredit": "",
            "Mark": "A",
            "CHSType": "High School"
          },
          {
            "CourseID": "ENG2001B",
            "CourseTitle": "Hon English 9B",
            "CreditsAttempted": "0.50",
            "CreditsCompleted": "0.50",
            "VerifiedCredit": "",
            "Mark": "A",
            "CHSType": "High School"
          },
          {
            "CourseID": "WLG2138B",
            "CourseTitle": "Hon Spanish 3B",
            "CreditsAttempted": "0.50",
            "CreditsCompleted": "0.50",
            "VerifiedCredit": "",
            "Mark": "B",
            "CHSType": "High School"
          }
        ]
      },
      {
        "SchoolName": "Walt Whitman High",
        "Year": "2023",
        "TermName": "S1",
        "TermOrder": 20,
        "Courses": [
          {
            "CourseID": "SOC2021A",
            "CourseTitle": "AP GovPolitics US NSL A",
            "CreditsAttempted": "0.50",
            "CreditsCompleted": "0.50",
            "VerifiedCredit": "",
            "Mark": "A",
            "CHSType": "High School"
          },
          {
            "CourseID": "ART2087A",
            "CourseTitle": "Chorus HS 1A",
            "CreditsAttempted": "0.50",
            "CreditsCompleted": "0.50",
            "VerifiedCredit": "",
            "Mark": "A",
            "CHSType": "High School"
          },
          {
            "CourseID": "MAT2012A",
            "CourseTitle": "Hon Algebra 2A",
            "CreditsAttempted": "0.50",
            "CreditsCompleted": "0.50",
            "VerifiedCredit": "",
            "Mark": "B",
            "CHSType": "Mark Exclusion - Higher Grade"
          },
          {
            "CourseID": "SCI2001A",
            "CourseTitle": "Hon Biology A",
            "CreditsAttempted": "0.50",
            "CreditsCompleted": "0.50",
            "VerifiedCredit": "",
            "Mark": "A",
            "CHSType": "High School"
          },
          {
            "CourseID": "ENG2001A",
            "CourseTitle": "Hon English 9A",
            "CreditsAttempted": "0.50",
            "CreditsCompleted": "0.50",
            "VerifiedCredit": "",
            "Mark": "A",
            "CHSType": "High School"
          },
          {
            "CourseID": "WLG2138A",
            "CourseTitle": "Hon Spanish 3A",
            "CreditsAttempted": "0.50",
            "CreditsCompleted": "0.50",
            "VerifiedCredit": "",
            "Mark": "A",
            "CHSType": "High School"
          },
          {
            "CourseID": "HPE2024",
            "CourseTitle": "Sp PE Ultimate",
            "CreditsAttempted": "0.50",
            "CreditsCompleted": "0.50",
            "VerifiedCredit": "",
            "Mark": "A",
            "CHSType": "High School"
          }
        ]
      }
    ]
  },
  {
    "Grade": "08",
    "GradeLevelOrder": 10,
    "Terms": [
      {
        "SchoolName": "Thomas W. Pyle Middle",
        "Year": "2022",
        "TermName": "Q4",
        "TermOrder": 40,
        "Courses": [
          {
            "CourseID": "HPE1005",
            "CourseTitle": "Physical Education Gr 8",
            "CreditsAttempted": "0.00",
            "CreditsCompleted": "0.00",
            "VerifiedCredit": "",
            "Mark": "A",
            "CHSType": "Middle School"
          }
        ]
      },
      {
        "SchoolName": "Thomas W. Pyle Middle",
        "Year": "2022",
        "TermName": "Q3",
        "TermOrder": 40,
        "Courses": [
          {
            "CourseID": "HPE1005",
            "CourseTitle": "Physical Education Gr 8",
            "CreditsAttempted": "0.00",
            "CreditsCompleted": "0.00",
            "VerifiedCredit": "",
            "Mark": "A",
            "CHSType": "Middle School"
          }
        ]
      },
      {
        "SchoolName": "Thomas W. Pyle Middle",
        "Year": "2022",
        "TermName": "Q2",
        "TermOrder": 40,
        "Courses": [
          {
            "CourseID": "HPE1005",
            "CourseTitle": "Physical Education Gr 8",
            "CreditsAttempted": "0.00",
            "CreditsCompleted": "0.00",
            "VerifiedCredit": "",
            "Mark": "A",
            "CHSType": "Middle School"
          }
        ]
      },
      {
        "SchoolName": "Thomas W. Pyle Middle",
        "Year": "2022",
        "TermName": "S2",
        "TermOrder": 25,
        "Courses": [
          {
            "CourseID": "MAT2004B",
            "CourseTitle": "Hon Geometry B",
            "CreditsAttempted": "0.50",
            "CreditsCompleted": "0.50",
            "VerifiedCredit": "",
            "Mark": "A",
            "CHSType": "High School"
          },
          {
            "CourseID": "TEC2017B",
            "CourseTitle": "Introduction to Engineering Design B",
            "CreditsAttempted": "0.50",
            "CreditsCompleted": "0.50",
            "VerifiedCredit": "",
            "Mark": "A",
            "CHSType": "High School"
          },
          {
            "CourseID": "WLG2132B",
            "CourseTitle": "Spanish 2B",
            "CreditsAttempted": "0.50",
            "CreditsCompleted": "0.50",
            "VerifiedCredit": "",
            "Mark": "A",
            "CHSType": "High School"
          }
        ]
      },
      {
        "SchoolName": "Thomas W. Pyle Middle",
        "Year": "2022",
        "TermName": "S1",
        "TermOrder": 20,
        "Courses": [
          {
            "CourseID": "MAT2004A",
            "CourseTitle": "Hon Geometry A",
            "CreditsAttempted": "0.50",
            "CreditsCompleted": "0.50",
            "VerifiedCredit": "",
            "Mark": "A",
            "CHSType": "High School"
          },
          {
            "CourseID": "TEC2017A",
            "CourseTitle": "Introduction to Engineering Design A",
            "CreditsAttempted": "0.50",
            "CreditsCompleted": "0.50",
            "VerifiedCredit": "",
            "Mark": "A",
            "CHSType": "High School"
          },
          {
            "CourseID": "WLG2132A",
            "CourseTitle": "Spanish 2A",
            "CreditsAttempted": "0.50",
            "CreditsCompleted": "0.50",
            "VerifiedCredit": "",
            "Mark": "A",
            "CHSType": "High School"
          }
        ]
      },
      {
        "SchoolName": "Thomas W. Pyle Middle",
        "Year": "2022",
        "TermName": "YR",
        "TermOrder": 10,
        "Courses": [
          {
            "CourseID": "ENG1014",
            "CourseTitle": "Grade 8 Adv English",
            "CreditsAttempted": "0.00",
            "CreditsCompleted": "0.00",
            "VerifiedCredit": "",
            "Mark": "A",
            "CHSType": "Middle School"
          },
          {
            "CourseID": "SOC1020",
            "CourseTitle": "Historical Inquiry American Studies",
            "CreditsAttempted": "0.00",
            "CreditsCompleted": "0.00",
            "VerifiedCredit": "",
            "Mark": "A",
            "CHSType": "Middle School"
          },
          {
            "CourseID": "SCI1004",
            "CourseTitle": "Invstig In Science 8",
            "CreditsAttempted": "0.00",
            "CreditsCompleted": "0.00",
            "VerifiedCredit": "",
            "Mark": "A",
            "CHSType": "Middle School"
          }
        ]
      },
      {
        "SchoolName": "Thomas W. Pyle Middle",
        "Year": "2021",
        "TermName": "Q1",
        "TermOrder": 40,
        "Courses": [
          {
            "CourseID": "HPE1002",
            "CourseTitle": "Health Education Gr 8",
            "CreditsAttempted": "0.00",
            "CreditsCompleted": "0.00",
            "VerifiedCredit": "",
            "Mark": "A",
            "CHSType": "Middle School"
          }
        ]
      }
    ]
  },
  {
    "Grade": "07",
    "GradeLevelOrder": 9,
    "Terms": [
      {
        "SchoolName": "Thomas W. Pyle Middle",
        "Year": "2021",
        "TermName": "Q4",
        "TermOrder": 40,
        "Courses": [
          {
            "CourseID": "HPE1004",
            "CourseTitle": "Physical Education Gr 7",
            "CreditsAttempted": "0.00",
            "CreditsCompleted": "0.00",
            "VerifiedCredit": "",
            "Mark": "A",
            "CHSType": "Middle School"
          }
        ]
      },
      {
        "SchoolName": "Thomas W. Pyle Middle",
        "Year": "2021",
        "TermName": "Q3",
        "TermOrder": 40,
        "Courses": [
          {
            "CourseID": "HPE1001",
            "CourseTitle": "Health Education Gr 7",
            "CreditsAttempted": "0.00",
            "CreditsCompleted": "0.00",
            "VerifiedCredit": "",
            "Mark": "A",
            "CHSType": "Middle School"
          }
        ]
      },
      {
        "SchoolName": "Thomas W. Pyle Middle",
        "Year": "2021",
        "TermName": "Q2",
        "TermOrder": 40,
        "Courses": [
          {
            "CourseID": "HPE1004",
            "CourseTitle": "Physical Education Gr 7",
            "CreditsAttempted": "0.00",
            "CreditsCompleted": "0.00",
            "VerifiedCredit": "",
            "Mark": "A",
            "CHSType": "Middle School"
          }
        ]
      },
      {
        "SchoolName": "Thomas W. Pyle Middle",
        "Year": "2021",
        "TermName": "S2",
        "TermOrder": 25,
        "Courses": [
          {
            "CourseID": "MAT2000B",
            "CourseTitle": "Algebra 1B",
            "CreditsAttempted": "0.50",
            "CreditsCompleted": "0.50",
            "VerifiedCredit": "",
            "Mark": "A",
            "CHSType": "High School"
          }
        ]
      },
      {
        "SchoolName": "Thomas W. Pyle Middle",
        "Year": "2021",
        "TermName": "S1",
        "TermOrder": 20,
        "Courses": [
          {
            "CourseID": "MAT2000A",
            "CourseTitle": "Algebra 1A",
            "CreditsAttempted": "0.50",
            "CreditsCompleted": "0.50",
            "VerifiedCredit": "",
            "Mark": "A",
            "CHSType": "High School"
          }
        ]
      },
      {
        "SchoolName": "Thomas W. Pyle Middle",
        "Year": "2021",
        "TermName": "YR",
        "TermOrder": 10,
        "Courses": [
          {
            "CourseID": "ART1041",
            "CourseTitle": "Chorus MS 2",
            "CreditsAttempted": "0.00",
            "CreditsCompleted": "0.00",
            "VerifiedCredit": "",
            "Mark": "A",
            "CHSType": "Middle School"
          },
          {
            "CourseID": "ENG1012",
            "CourseTitle": "Grade 7 Adv English",
            "CreditsAttempted": "0.00",
            "CreditsCompleted": "0.00",
            "VerifiedCredit": "",
            "Mark": "A",
            "CHSType": "High School"
          },
          {
            "CourseID": "SOC1010",
            "CourseTitle": "Historical Inquiry Global Hum 7",
            "CreditsAttempted": "0.00",
            "CreditsCompleted": "0.00",
            "VerifiedCredit": "",
            "Mark": "B",
            "CHSType": "Middle School"
          },
          {
            "CourseID": "SCI1003",
            "CourseTitle": "Invstig In Science 7",
            "CreditsAttempted": "0.00",
            "CreditsCompleted": "0.00",
            "VerifiedCredit": "",
            "Mark": "A",
            "CHSType": "Middle School"
          },
          {
            "CourseID": "WLG1005B",
            "CourseTitle": "MS FY Spanish 1B",
            "CreditsAttempted": "0.50",
            "CreditsCompleted": "0.50",
            "VerifiedCredit": "",
            "Mark": "A",
            "CHSType": "High School"
          }
        ]
      },
      {
        "SchoolName": "Thomas W. Pyle Middle",
        "Year": "2020",
        "TermName": "Q1",
        "TermOrder": 40,
        "Courses": [
          {
            "CourseID": "HPE1004",
            "CourseTitle": "Physical Education Gr 7",
            "CreditsAttempted": "0.00",
            "CreditsCompleted": "0.00",
            "VerifiedCredit": "",
            "Mark": "A",
            "CHSType": "Middle School"
          }
        ]
      }
    ]
  },
  {
    "Grade": "06",
    "GradeLevelOrder": 8,
    "Terms": [
      {
        "SchoolName": "Thomas W. Pyle Middle",
        "Year": "2020",
        "TermName": "Q4",
        "TermOrder": 40,
        "Courses": [
          {
            "CourseID": "7891",
            "CourseTitle": "PHYS ED GRADE 6",
            "CreditsAttempted": "0.00",
            "CreditsCompleted": "0.00",
            "VerifiedCredit": "",
            "Mark": "P",
            "CHSType": "Middle School"
          }
        ]
      },
      {
        "SchoolName": "Thomas W. Pyle Middle",
        "Year": "2020",
        "TermName": "Q3",
        "TermOrder": 40,
        "Courses": [
          {
            "CourseID": "7891",
            "CourseTitle": "PHYS ED GRADE 6",
            "CreditsAttempted": "0.00",
            "CreditsCompleted": "0.00",
            "VerifiedCredit": "",
            "Mark": "A",
            "CHSType": "Middle School"
          }
        ]
      },
      {
        "SchoolName": "Thomas W. Pyle Middle",
        "Year": "2020",
        "TermName": "Q2",
        "TermOrder": 40,
        "Courses": [
          {
            "CourseID": "7891",
            "CourseTitle": "PHYS ED GRADE 6",
            "CreditsAttempted": "0.00",
            "CreditsCompleted": "0.00",
            "VerifiedCredit": "",
            "Mark": "A",
            "CHSType": "Middle School"
          }
        ]
      },
      {
        "SchoolName": "Thomas W. Pyle Middle",
        "Year": "2020",
        "TermName": "YR",
        "TermOrder": 10,
        "Courses": [
          {
            "CourseID": "1075",
            "CourseTitle": "Grade 6 Adv English",
            "CreditsAttempted": "0.00",
            "CreditsCompleted": "0.00",
            "VerifiedCredit": "",
            "Mark": "A",
            "CHSType": "Middle School"
          },
          {
            "CourseID": "2120",
            "CourseTitle": "Hist Inquiry Global Humanities 6",
            "CreditsAttempted": "0.00",
            "CreditsCompleted": "0.00",
            "VerifiedCredit": "",
            "Mark": "A",
            "CHSType": "Middle School"
          },
          {
            "CourseID": "3528",
            "CourseTitle": "Investig in Science 6",
            "CreditsAttempted": "0.00",
            "CreditsCompleted": "0.00",
            "VerifiedCredit": "",
            "Mark": "A",
            "CHSType": "Middle School"
          },
          {
            "CourseID": "3001",
            "CourseTitle": "MATHINVSTGTIONS",
            "CreditsAttempted": "0.00",
            "CreditsCompleted": "0.00",
            "VerifiedCredit": "",
            "Mark": "A",
            "CHSType": "Middle School"
          },
          {
            "CourseID": "6690",
            "CourseTitle": "MS Chorus 1",
            "CreditsAttempted": "0.00",
            "CreditsCompleted": "0.00",
            "VerifiedCredit": "",
            "Mark": "A",
            "CHSType": "Middle School"
          },
          {
            "CourseID": "1700",
            "CourseTitle": "MS FY SPANISH 1A",
            "CreditsAttempted": "0.50",
            "CreditsCompleted": "0.50",
            "VerifiedCredit": "",
            "Mark": "A",
            "CHSType": "High School"
          }
        ]
      },
      {
        "SchoolName": "Thomas W. Pyle Middle",
        "Year": "2019",
        "TermName": "Q1",
        "TermOrder": 40,
        "Courses": [
          {
            "CourseID": "7609",
            "CourseTitle": "HEALTH ED GR 6",
            "CreditsAttempted": "0.00",
            "CreditsCompleted": "0.00",
            "VerifiedCredit": "",
            "Mark": "A",
            "CHSType": "Middle School"
          }
        ]
      }
    ]
  }
];

export{};