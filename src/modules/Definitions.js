module.exports = { GetDefinition };

function GetDefinition(type, code) {
  //Store definitions
  const errorCodes = {
    0: "No issues detected",

    101: "Grid voltage beyond permitted limits",
    107: "Synchronisation with the public mains supply not possible",
    108: "Islanding detected",

    201: "Grid voltage beyond permitted limits",
    202: "Grid voltage is lower than the specified limit",
    203: "Grid frequency is higher than the specified limit",
    204: "Grid frequency is lower than the specified limit",
    205: "Change of public mains impedance",
    206: "Absolute value of the impedance is too high",
    207: "Mains relay does not open in spite of switch off signal",
    208: "Mains relay does not close in spite of switch on signal",

    301: "Safety circuit detects a current peak on the PV generator side",
    303: "Heat sink temperature on the DC-AC board is too high",
    304: "Heat sink temperature on the DC-DC board is too high",
    305: "Feed-in process not possible, even though public mains parameter within the limits",
    306: "POWER LOW",
    307: "DC LOW",
    308: "Intermediate circuit voltage out of the maximum limit",

    401: "Communication error between IG control and the DC-DC board",
    402: "Write access to the internal Fronius IG memory failed",
    403: "The area in the internal memory for the country setting is incomplete",
    404: "Connection between the control unit and the ENS is faulty",
    405: "An old or incorrect version of the ENS microprocessors has been recognised",
    406: "Temperature sensor on the DC-AC board faulty or not connected",
    407: "Temperature sensor on the DC-DC board faulty or not connected",
    408: "Unsymmetry on the public mains detected",
    409: "Supply of the DC-AC board not available",
    410: "Service plug on the DC-AC board is not set correctly",
    412: "Value for fixed voltage is set higher than the open circuit voltage of the PV generator",
    413: "Open circuit voltage too high in the moment of transformer switching",
    414: "Memory array for Fronius IG type in EE-PROM faulty",
    415: "No END-enabling signal despite release by IG-control",
    416: "Communication error between IG-Control and power stack",
    417: "Hardware ID-collision",
    419: "Two or more power stacks with identical Unique ID",
    420: "Incomplete number of power stacks detected after reaching online threshold according to device type",
    422: "Hardware ID sequence error",
    425: "Receive time-out for data exchange with one or more power stacks exceeded",
    431: "All power stacks are in boot mode",
    432: "Consistent error in power stack management",
    433: "Allocation error of dynamic addresses",
    434: "Ground fault detected",
    435: "Wrong configuration for EE-Prom",
    436: "Error transmission faulty",
    437: "Power stack work around is active",
    438: "Error during state code transmission",
    441: "Power rack fan faulty",
    442: "Master for one phase could not be assigned",
    443: "DC-DC energy transfer failure",
    444: "AC monitoring self test interrupted",

    501: "Heat sink temperature too high, although Fronius IG is on low output",
    504: "An isolation fault between DC+ or DC- to earth has been detected",
    505: "The area in the internal memory for the “Setup” values is incomplete",
    506: "The area in the internal memory for the “Total” values is incomplete",
    507: "The area in the internal memory for the “Day/Year” values is incomplete",
    508: "The area in the internal memory for the “WR number” is damaged",
    509: "No feed in operation for 24 hours",
    510: "Errors detected by LocalNet self diagnostic system",
    511: "Errors detected by LocalNet Sensor Card self diagnostic system",
    512: "According to the device type too many power stacks have been detected",
    513: "Power stacks in boot mode",
    514: "Incomplete number of power stacks detected after reaching online threshold – Device type",
    515: "One or more power stacks notified  406 / 407 / 409 / 410",
    516: "One power stack exceeds the permitted limit of error messages per day (>50x)",
    517: "Permanent POWER LOW or DC LOW error",
    522: "DC1 Input Voltage too low",
    523: "DC2 Input Voltage too low",
    558: "Functional incompatibility (one or more PC boards in the inverter are not compatible with each other, e.g. after a PC board has been replaced)",
    560: "Derating caused by over-frequency",
    566: "Arc detector switched off (e.g. during external arc monitoring)",
    567: "Grid Voltage Dependent Power Reduction is active",
    
  }

  const statusCodes = {
    0: "Startup",
    1: "Startup",
    2: "Startup",
    3: "Startup",
    4: "Startup",
    5: "Startup",
    6: "Startup",
    7: "Running",
    8: "Standby",
    9: "Bootloading",
    10: "Error"
  }

  if(type === "errorCode") { return errorCodes[code] ? errorCodes[code]: "Not Found";  }
  else if(type === "statusCode") { return statusCodes[code] ? statusCodes[code] : "Not Found"; }
  else { return "Bad Type, This should never happen." }
}