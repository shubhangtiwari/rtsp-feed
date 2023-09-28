sudo timedatectl set-timezone Asia/Calcutta
sudo apt update
sudo apt upgrade -y

curl -fsSL https://deb.nodesource.com/setup_17.x | sudo -E bash -
sudo apt install -y nodejs ffmpeg

export PI_PASSWORD="replace_me"
export WIFI_PASSWORD="replace_me"

# Setup Wifi
cat <<EOT >> 50-cloud-init.yaml
# This file is generated from information provided by the datasource.  Changes
# to it will not persist across an instance reboot.  To disable cloud-init's
# network configuration capabilities, write a file
# /etc/cloud/cloud.cfg.d/99-disable-network-config.cfg with the following:
# network: {config: disabled}
network:
    wifis:
        wlan0:
            optional: true
            access-points:
                "Death Star":
                    password: $WIFI_PASSWORD
            dhcp4: true
EOT
sudo mv 50-cloud-init.yaml /etc/netplan/50-cloud-init.yaml

# Adjust hostname and enable multicast dns
echo pi > hostname
sudo mv hostname /etc/hostname
sudo sed -i 's/127.0.0.1 localhost/127.0.0.1 pi localhost/g' /etc/hosts
sudo sed -i 's/#LLMNR=no/LLMNR=yes/g' /etc/systemd/resolved.conf
sudo sed -i 's/#MulticastDNS=no/MulticastDNS=yes/g' /etc/systemd/resolved.conf
sudo systemd-resolve --set-mdns=yes --interface=wlan0
sudo systemctl restart systemd-resolved

# Mount external drive
sudo mkdir -p /glacier
sudo chown -R ubuntu:ubuntu /glacier
sudo chmod -R 755 /glacier
export drive=`blkid | grep sda1 | awk '{print $3}' | sed 's/"//g'`
echo "$drive /glacier exfat defaults,auto,umask=000,users,rw 0 0" | sudo tee -a /etc/fstab
sudo apt install -y samba
sudo smbpasswd -a ubuntu -n
cat << EOT >> temp.conf

[biggboss]
path = /glacier/recording
read only = yes
guest ok = yes
guest only = yes
EOT
cat temp.conf | sudo tee -a /etc/samba/smb.conf

reboot

# Post Installation Steps
git clone https://github.com/shubhangtiwari/rtsp-feed /home/ubuntu/rtsp-feed
cd /home/ubuntu/rtsp-feed
npm run build

crontab -e # will open editor to add new jobs. Copy paste the line below at the end of the file.
@reboot echo "$PI_PASSWORD" | sudo -S node /home/ubuntu/rtsp-feed/index.js > /home/ubuntu/rtsp-feed/.log 2>&1 &
@reboot echo "$PI_PASSWORD" | sudo -S systemd-resolve --set-mdns=yes --interface=wlan0
crontab -l # Execute this to confirm changes to cron
reboot
