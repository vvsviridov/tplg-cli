# Cli application based on ENM Topology Browser API

## Main goal

Main features is type suggestions everywhere where it is possible and detailed attributes and values description available in config mode.

## Installation

First you need **node.js** which can be downloaded from official site [nodejs.org](https://nodejs.org/en/download/) and installed as described in the docs.

Next clone or download this repository and run from the project root directory ...

```
npm install
```

... to install dependencies,

```
npm link
```

... to add application to your OS $PATH variable if you want to run it from anywhere.
Now you can launch apllication

```
tplg-cli -l USERNAME -p PASSWORD -u https://enm.your.company.domian.com
```

## Usage

Recommended environment is Windows Terminal (not _cmd.exe_) or any shell with rich formatting support. After application successfully launched you'll see root content and available commands.

```
PS C:\> tplg-cli -l USERNAME -p PASSWORD -u https://enm.your.company.domian.com
✔ Login in...
Authentication Successful
✔ Starting Topology Browser...
✔ Reading Topology...
 SubNetwork=ONRM_ROOT_MO> (Use arrow keys or type to search)
> SubNetwork=Core
  SubNetwork=LTE
  SubNetwork=RBS
  SubNetwork=RNC
  show
  config
  up
  home
  exit
```

### Commands

> **Note:** _only `show` and `fdn` command can have parameter, all other commands haven't._

- `show [<valid regex>]` - shows current object's attributes filtered with regex
- `config` - enters _config_ mode
- `up` - navigate up one level
- `fdn <valid FDN>` - navigate to FDN
- `home` - navigate to root folder
- `alarms` - show alarms
- `sync` - initiate node synchronization
- `persistent` - toggle persistent attributes inclusion
- `exit` - logout and exit application

Start typing and you see only matches commands to your input.

```
SubNetwork=ONRM_ROOT_MO> subn
> SubNetwork=Core
  SubNetwork=LTE
  SubNetwork=RBS
  SubNetwork=RNC
SubNetwork=ONRM_ROOT_MO> exi
>exit
```

You can navigate to the next level selecting object ...

```
SubNetwork=ONRM_ROOT_MO> subn
  SubNetwork=Core
  SubNetwork=LTE
  SubNetwork=RBS
> SubNetwork=RNC
SubNetwork=ONRM_ROOT_MO,SubNetwork=RNC>
> MeContext=RNC01
  MeContext=RNCTEST
  MeContext=TEST
```

View objects attributes ...

```
SubNetwork=ONRM_ROOT_MO,SubNetwork=RNC> show
> show
✔ Reading Topology...

  FDN: SubNetwork=ONRM_ROOT_MO,SubNetwork=RNC

  SubNetworkId: RNC

SubNetwork=ONRM_ROOT_MO,SubNetwork=RNC> MeContext=RNC01
> MeContext=RNC01
✔ Reading Topology...
... Network=ONRM_ROOT_MO,SubNetwork=RNC,MeContext=RNC01> show
> show
✔ Reading Topology...

  FDN: SubNetwork=ONRM_ROOT_MO,SubNetwork=RNC,MeContext=RNC01

  MeContextId: RNC01
  neType: RNC
  platformType: CPP
```

... show attributes with filter

```
... Network=ONRM_ROOT_MO,SubNetwork=RNC,MeContext=RNC01> show Type
> show type
✔ Reading Topology...

  FDN: SubNetwork=ONRM_ROOT_MO,SubNetwork=RNC,MeContext=RNC01

  neType: RNC
  platformType: CPP

... Network=ONRM_ROOT_MO,SubNetwork=RNC,MeContext=RNC01>
```

Return one level up in FDN tree ...

```
... Network=ONRM_ROOT_MO,SubNetwork=RNC,MeContext=RNC01> up
> up
✔ Reading Topology...
SubNetwork=ONRM_ROOT_MO,SubNetwork=RNC>
```

Return to the root from anywhere ...

```
... Network=ONRM_ROOT_MO,SubNetwork=RNC,MeContext=RNC01> home
> home
✔ Reading Topology...
SubNetwork=ONRM_ROOT_MO>
```

Go to specific FDN ...

```
... Network=ONRM_ROOT_MO,SubNetwork=RNC,MeContext=RNC01> fdn NetworkElement=RBS01
```

And logout and exit ...

```
... Network=ONRM_ROOT_MO,SubNetwork=RNC,MeContext=RNC01> exit
> exit
✔ Logout...
Logout OK
PS C:\>
```

### Config Mode

To modify attributes _config_ mode is used.

Available commands are:

- `commit` - commiting changes to the network
- `check` - view configuration changes
- `end` - end config mode without commiting
- `exit` - logout and exit application

```
... ManagedElement=ERBS01,ENodeBFunction=1,EUtranCellFDD=test1> config
> config
✔ Reading Attributes...
✔ Reading Attributes Data...

    syncStatus: SYNCHRONIZED
    ipAddress: 10.10.11.1
    managementState: NORMAL
    radioAccessTechnology: 4G, 3G

... lement=ERBS01,ENodeBFunction=1,EUtranCellFDD=test1(config)# (Use arrow keys or type to search)
> acBarringForCsfb
  acBarringForEmergency
  acBarringForMoData
  acBarringForMoSignalling
  ...
  commit
  check
  end
  exit
(Move up and down to reveal more choices)
```

To modify attribute select it ...

```
... lement=ERBS01,ENodeBFunction=1,EUtranCellFDD=test1(config)# userLabel
... ent=ERBS01,ENodeBFunction=1,EUtranCellFDD=test1(userLabel)#
  commit
  check
  end
  exit
> get
  set
  description
```

Now you can get it ...

```
... ent=ERBS01,ENodeBFunction=1,EUtranCellFDD=test1(userLabel)# get
> get

  FDN: SubNetwork=ONRM_ROOT_MO,SubNetwork=RBS,MeContext=ERBS01,ManagedElement=1,ENodeBFunction=1,EUtranCellFDD=test1(userLabel)

  userLabel: test1

  Type: STRING

```

And set it's value ...

```
... ent=ERBS01,ENodeBFunction=1,EUtranCellFDD=test1(userLabel)# set
? userLabel (STRING): ? test_label
```

Check configuration before applying

```
... ent=ERBS01,ENodeBFunction=1,EUtranCellFDD=test1(userLabel)# check

  FDN: SubNetwork=ONRM_ROOT_MO,SubNetwork=RBS,MeContext=ERBS01,ManagedElement=ERBS01,ENodeBFunction=1,EUtranCellFDD=test1

  userLabel: test_label

```

Applying changes to the network ...

```
... ent=ERBS01,ENodeBFunction=1,EUtranCellFDD=test1(userLabel)# commit

  FDN: SubNetwork=ONRM_ROOT_MO,SubNetwork=RBS,MeContext=ERBS01,ManagedElement=ERBS01,ENodeBFunction=1,EUtranCellFDD=test1

  userLabel: test_label
✔ Commiting Config...
Success
```

View attribute's description

```
... lement=ERBS01,ENodeBFunction=1,EUtranCellFDD=test1(config)# acBarringForCsfb
... S01,ENodeBFunction=1,EUtranCellFDD=test1(acBarringForCsfb)# description

acBarringForCsfb: COMPLEX_REF

DESCRIPTION
      Access class barring parameters for mobile originating CSFB calls.
The information is broadcasted in SIB2.

TRAFFIC DISTURBANCES
      Changing this attribute can cause loss of traffic.

IMMUTABLE
      false

ACTIVE CHOICE CASE
      null


COMPLEX_REF
    AcBarringConfig: AcBarringConfig


acBarringTime: INTEGER  default: 64

DESCRIPTION
      Mean access barring time in seconds for mobile originating signalling.

IMMUTABLE
      false

ACTIVE CHOICE CASE
      null

CONSTRAINTS
    Nullable: false
    Value Resolution: null


acBarringForSpecialAC: LIST  default: false,false,false,false,false

DESCRIPTION
      Access class barring for AC 11-15. The first instance in the list is for AC 11, second is for AC 12, and so on.

IMMUTABLE
      false

ACTIVE CHOICE CASE
      null

CONSTRAINTS
    Nullable: false
LISTREFERENCE
    BOOLEAN
CONSTRAINTS
    Nullable: true


acBarringFactor: INTEGER  default: 95

DESCRIPTION
      If the random number drawn by the UE is lower than this value, access is allowed. Otherwise the access is barred.

IMMUTABLE
      false

ACTIVE CHOICE CASE
      null

CONSTRAINTS
    Nullable: false
    Value Resolution: null
```

## Contribution

1. [Fork it]
2. Create your feature branch (`git checkout -b my-new-feature`)
3. Commit your changes (`git commit -am 'Add some feature'`)
4. Push to the branch (`git push origin my-new-feature`)
5. Create new Pull Request

## Known Issues

### flickering issue

In some windows terminal spinner may look flickery. To fix this you need to modify file ./node_modules/ora/index.js

Add 1 to _clearLine()_ on this line

```javascript
this.stream.clearLine(1);
```

### Issue with type SHORT

EMN returns error if commited configuration includes attributes with type SHORT. It is not an application issue and should be fixed in API by Ericsson.

## Credits

[Contact Me](https://github.com/vvsviridov/) to request new feature or bugs reporting.

## Changes

1.0.1a - `show` command filter is regex now

1.0.2a - Adding `fdn` command

1.0.3a - Adding `persistent` command

1.0.4a - Error corrections

1.0.5a - Added `alarms`, `sync` commands
