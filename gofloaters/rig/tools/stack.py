"""Layer stacking order (front -> back) and hierarchy shared by every tool."""
ORDER = [
    "CTRL_Tilo", "Tilo_Root", "Flight", "Dog_Root", "Dog_Chest",
    "Propeller", "Propeller_Blur",
    "Paw_Near", "Arm_Near_Fore", "Arm_Near_Upper",
    "Goggles", "Eyelid_Upper", "Eyelid_Lower", "Pupil", "Eye_White", "Face", "Ear_Near", "Head", "Ear_Far",
    "Wing", "Stabilizer", "Plane_Body",
    "Dog_Body", "Tail",
    "Paw_Far", "Arm_Far_Fore", "Arm_Far_Upper",
    "Cockpit",
    "Airflow_01", "Airflow_02", "Airflow_03", "Airflow_04", "Airflow_05", "Airflow_06", "Airflow_07",
]
PARENT = {
    "Tilo_Root": None, "CTRL_Tilo": None,
    "Flight": "Tilo_Root",
    "Plane_Body": "Flight", "Wing": "Plane_Body", "Stabilizer": "Plane_Body", "Cockpit": "Plane_Body",
    "Propeller": "Plane_Body", "Propeller_Blur": "Plane_Body",
    "Dog_Root": "Plane_Body", "Dog_Chest": "Dog_Root", "Dog_Body": "Dog_Root", "Tail": "Dog_Root",
    "Head": "Dog_Chest", "Ear_Far": "Head", "Ear_Near": "Head", "Face": "Head", "Goggles": "Head",
    "Eye_White": "Head", "Pupil": "Head", "Eyelid_Upper": "Head", "Eyelid_Lower": "Head",
    "Arm_Near_Upper": "Dog_Chest", "Arm_Near_Fore": "Arm_Near_Upper", "Paw_Near": "Arm_Near_Fore",
    "Arm_Far_Upper": "Dog_Chest", "Arm_Far_Fore": "Arm_Far_Upper", "Paw_Far": "Arm_Far_Fore",
    **{f"Airflow_0{i}": "Flight" for i in range(1, 8)},
}
