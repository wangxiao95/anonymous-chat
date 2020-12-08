#!/bin/bash
passwd='wangxiao11.'
/usr/bin/expect <<-EOF
set time 30
spawn ssh root@39.105.86.124
expect {
"*yes/no" { send "yes\r"; exp_continue }
"*password:" { send "$passwd\r" }
}
expect "*#"
send "cd /home/anonymous-chat\r"
expect "*#"
send "ls\r"
expect "*#"
send "git pull\r"
expect "*#"
send "pm2 ls\r"
expect "*#"
send "pm2 restart index\r"
expect "*#"
interact
expect eof
EOF